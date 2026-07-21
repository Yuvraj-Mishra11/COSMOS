import axios from 'axios';

const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX;

// ==================== HELPERS ====================
const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const getSentences = (text, count = 4) => {
  if (!text) return '';
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  return sentences.slice(0, count).join('. ') + '.';
};

// ==================== DUCKDUCKGO ====================
const searchDuckDuckGo = async (query) => {
  try {
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: { q: query, format: 'json', no_html: 1, skip_disambig: 1 },
      timeout: 10000
    });
    return response.data;
  } catch (e) {
    console.error('DuckDuckGo error:', e.message);
    return null;
  }
};

// ==================== TAVILY ====================
const searchTavily = async (query) => {
  if (!TAVILY_API_KEY) return null;
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        query: query,
        search_depth: 'advanced',
        max_results: 10,
        include_answer: true,
        include_raw_content: true
      },
      {
        headers: { 'Authorization': `Bearer ${TAVILY_API_KEY}` },
        timeout: 15000
      }
    );
    return response.data;
  } catch (e) {
    console.error('Tavily error:', e.message);
    return null;
  }
};

// ==================== GOOGLE ====================
const searchGoogle = async (query) => {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) return [];
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: { key: GOOGLE_API_KEY, cx: GOOGLE_CX, q: query, num: 10 },
      timeout: 10000
    });
    return response.data.items || [];
  } catch (e) {
    console.error('Google error:', e.message);
    return [];
  }
};

// ==================== PARSERS ====================
// Parse DuckDuckGo - Better extraction
const parseDuckDuckGo = (data) => {
  let overview = '';
  const concepts = [];
  const facts = [];
  const articles = [];

  // Get clean abstract
  if (data.AbstractText) {
    overview = getSentences(data.AbstractText, 4);
  }

  // Get heading as title fallback
  if (!overview && data.Heading) {
    overview = data.Heading;
  }

  // Process Related Topics - filter out junk
  if (data.RelatedTopics) {
    data.RelatedTopics.forEach(topic => {
      if (topic.Text) {
        const text = cleanText(topic.Text);
        // Skip if it looks like a social media link or subscriber count
        if (text.includes('instagram') || text.includes('youtube') || 
            text.includes('subscriber') || text.includes('followers') ||
            text.includes('@') || text.includes('http')) {
          return;
        }
        const parts = text.split(' - ');
        const title = parts[0]?.trim() || 'Related';
        const description = parts.slice(1).join(' - ').trim() || text;
        if (description.length > 30 && concepts.length < 6) {
          concepts.push({ name: title.slice(0, 45), description: getSentences(description, 2) });
        }
        if (text.length > 40 && facts.length < 10) {
          facts.push(getSentences(text, 1));
        }
        if (topic.url && articles.length < 6) {
          articles.push({ title: title.slice(0, 60), url: topic.url, source: 'DuckDuckGo' });
        }
      }
    });
  }

  // Process Infobox - clean key facts
  if (data.Infobox) {
    data.Infobox.content.forEach(item => {
      if (item.label && item.value && facts.length < 12) {
        const cleanValue = cleanText(item.value);
        // Skip if value looks like a link or social media
        if (cleanValue.length > 10 && 
            !cleanValue.includes('http') && 
            !cleanValue.includes('@') &&
            !cleanValue.includes('instagram') &&
            !cleanValue.includes('youtube')) {
          facts.push(`${item.label}: ${cleanValue}`);
        }
      }
    });
  }

  return { overview, concepts, facts, articles };
};

// Parse Tavily - Better extraction
const parseTavily = (data) => {
  const concepts = [];
  const facts = [];
  const articles = [];

  if (data.results) {
    data.results.forEach(r => {
      const content = cleanText(r.content || r.snippet || '');
      const title = cleanText(r.title || '');
      
      // Skip junk content
      if (content.includes('instagram') || content.includes('youtube') ||
          content.includes('subscriber') || content.includes('followers') ||
          content.includes('@') || content.length < 30) {
        return;
      }
      
      if (content.length > 50 && concepts.length < 6) {
        concepts.push({
          name: title.slice(0, 45) || `Concept ${concepts.length + 1}`,
          description: getSentences(content, 2)
        });
      }
      if (content.length > 40) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
        sentences.slice(0, 2).forEach(s => {
          if (facts.length < 15 && !s.includes('instagram') && !s.includes('youtube')) {
            facts.push(s.trim() + '.');
          }
        });
      }
      if (r.url && articles.length < 6) {
        articles.push({ title: title.slice(0, 60) || 'Article', url: r.url, source: 'Tavily' });
      }
    });
  }

  return { concepts, facts, articles };
};

// Parse Google - Better extraction
const parseGoogle = (items) => {
  const facts = [];
  const articles = [];
  items.forEach(item => {
    const title = cleanText(item.title || '');
    const snippet = cleanText(item.snippet || '');
    
    // Skip junk content
    if (snippet.includes('instagram') || snippet.includes('youtube') ||
        snippet.includes('subscriber') || snippet.includes('followers') ||
        snippet.includes('@') || snippet.length < 30) {
      return;
    }
    
    if (snippet.length > 30) {
      const sentences = snippet.split(/[.!?]+/).filter(s => s.trim().length > 30);
      sentences.slice(0, 2).forEach(s => {
        if (facts.length < 15 && !s.includes('instagram') && !s.includes('youtube')) {
          facts.push(s.trim() + '.');
        }
      });
    }
    if (item.link && articles.length < 6) {
      articles.push({ title: title.slice(0, 60) || 'Article', url: item.link, source: 'Google' });
    }
  });
  return { facts, articles };
};

// ==================== MAIN FUNCTION ====================
export const generateTopicContent = async (topicId, topicTitle, onProgress) => {
  // Check cache
  const cached = localStorage.getItem(`topic_${topicId}`);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }

  console.log('Searching for:', topicTitle);
  if (onProgress) onProgress('🔍 Researching...');

  let overview = '';
  let concepts = [];
  let facts = [];
  let articles = [];

  try {
    // Run all searches in parallel
    const [duckData, tavilyData, googleItems] = await Promise.all([
      searchDuckDuckGo(topicTitle),
      searchTavily(topicTitle),
      searchGoogle(topicTitle)
    ]);

    // Process DuckDuckGo
    if (duckData) {
      const parsed = parseDuckDuckGo(duckData);
      if (parsed.overview) overview = parsed.overview;
      parsed.concepts.forEach(c => { if (concepts.length < 8) concepts.push(c); });
      parsed.facts.forEach(f => { if (facts.length < 15) facts.push(f); });
      parsed.articles.forEach(a => { if (articles.length < 6) articles.push(a); });
      console.log('DuckDuckGo:', { concepts: concepts.length, facts: facts.length });
    }

    // Process Tavily
    if (tavilyData) {
      const parsed = parseTavily(tavilyData);
      if (parsed.overview && !overview) overview = parsed.overview;
      parsed.concepts.forEach(c => { if (concepts.length < 10) concepts.push(c); });
      parsed.facts.forEach(f => { if (facts.length < 20) facts.push(f); });
      parsed.articles.forEach(a => { if (articles.length < 8) articles.push(a); });
      console.log('Tavily:', { concepts: concepts.length, facts: facts.length });
    }

    // Process Google
    if (googleItems.length > 0) {
      const parsed = parseGoogle(googleItems);
      parsed.facts.forEach(f => { if (facts.length < 20) facts.push(f); });
      parsed.articles.forEach(a => { if (articles.length < 8) articles.push(a); });
      console.log('Google:', { facts: facts.length });
    }

    // Ensure overview
    if (!overview || overview.length < 50) {
      overview = `Explore ${topicTitle}. This topic covers important concepts, discoveries, and historical significance.`;
    }

    // Deduplicate facts
    const uniqueFacts = [];
    const seenFacts = new Set();
    facts.forEach(f => {
      const key = f.slice(0, 60);
      if (!seenFacts.has(key) && uniqueFacts.length < 15 && f.length > 20) {
        seenFacts.add(key);
        uniqueFacts.push(f);
      }
    });
    facts = uniqueFacts;

    if (facts.length === 0) {
      facts = [
        `${topicTitle} is a significant topic.`,
        `Research on ${topicTitle} continues to evolve.`,
        `Many discoveries have been made about ${topicTitle}.`
      ];
    }

    // Deduplicate concepts
    const uniqueConcepts = [];
    const seenNames = new Set();
    concepts.forEach(c => {
      const key = c.name.toLowerCase().slice(0, 20);
      if (!seenNames.has(key) && uniqueConcepts.length < 8 && c.description.length > 20) {
        seenNames.add(key);
        uniqueConcepts.push(c);
      }
    });
    concepts = uniqueConcepts;

    if (concepts.length === 0) {
      concepts = [
        { name: 'Core Concepts', description: `Key ideas related to ${topicTitle}.` },
        { name: 'Learn More', description: 'Explore deeper through our research tools.' }
      ];
    }

    // Deduplicate articles
    const uniqueArticles = [];
    const seenUrls = new Set();
    articles.forEach(a => {
      if (!seenUrls.has(a.url) && uniqueArticles.length < 6) {
        seenUrls.add(a.url);
        uniqueArticles.push(a);
      }
    });
    articles = uniqueArticles;

    const content = {
      title: topicTitle,
      icon: '🔍',
      subtitle: 'Researched from DuckDuckGo + Tavily + Google',
      overview: overview.slice(0, 1500),
      timeline: [],
      concepts: concepts.slice(0, 8).map(c => ({
        name: c.name.slice(0, 50),
        description: c.description.slice(0, 350)
      })),
      facts: facts.slice(0, 15),
      articles: articles.slice(0, 6),
      relatedTopics: ['Black Holes', 'Ancient Egypt', 'Artificial Intelligence', 'Deep Ocean', 'Solar System'],
      recommendations: [
        { title: 'Explore More Topics', type: 'article', description: 'Continue your journey of discovery.' }
      ]
    };

    localStorage.setItem(`topic_${topicId}`, JSON.stringify(content));
    if (onProgress) onProgress('✅ Research complete!');
    console.log('✅ Content generated with', facts.length, 'facts');
    return content;

  } catch (error) {
    console.error('Search error:', error);
    return {
      title: topicTitle,
      icon: '🔍',
      subtitle: 'Content being prepared',
      overview: `Learn about ${topicTitle}. This topic explores important concepts and discoveries.`,
      timeline: [],
      concepts: [{ name: 'Core Concepts', description: `Key ideas related to ${topicTitle}.` }],
      facts: ['Information is being gathered.', 'Please try again later.'],
      articles: [],
      relatedTopics: ['Black Holes', 'Ancient Egypt', 'Artificial Intelligence', 'Deep Ocean', 'Solar System'],
      recommendations: [{ title: 'Explore More Topics', type: 'article', description: 'Continue your journey of discovery.' }]
    };
  }
};
