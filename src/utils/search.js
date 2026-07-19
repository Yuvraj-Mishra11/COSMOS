import axios from 'axios';

const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX;

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

const getSentences = (text, count = 3) => {
  if (!text) return '';
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
  return sentences.slice(0, count).join('. ') + '.';
};

// 1. DuckDuckGo
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

// 2. Tavily
const searchTavily = async (query) => {
  if (!TAVILY_API_KEY) return null;
  try {
    const response = await axios.post(
      'https://api.tavily.com/search',
      {
        query: query,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true
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

// 3. Google
const searchGoogle = async (query) => {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) return [];
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: { key: GOOGLE_API_KEY, cx: GOOGLE_CX, q: query, num: 5 },
      timeout: 10000
    });
    return response.data.items || [];
  } catch (e) {
    console.error('Google error:', e.message);
    return [];
  }
};

// Parse DuckDuckGo
const parseDuckDuckGo = (data) => {
  let overview = '';
  const concepts = [];
  const facts = [];
  const articles = [];

  if (data.AbstractText) {
    overview = getSentences(data.AbstractText, 4);
  }

  if (data.RelatedTopics) {
    data.RelatedTopics.forEach(topic => {
      if (topic.Text) {
        const text = cleanText(topic.Text);
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

  if (data.Infobox) {
    data.Infobox.content.forEach(item => {
      if (item.label && item.value && facts.length < 12) {
        const cleanValue = cleanText(item.value);
        if (cleanValue.length > 10) facts.push(`${item.label}: ${cleanValue}`);
      }
    });
  }

  return { overview, concepts, facts, articles };
};

// Parse Tavily
const parseTavily = (data) => {
  const concepts = [];
  const facts = [];
  const articles = [];

  if (data.results) {
    data.results.forEach(r => {
      const content = cleanText(r.content || r.snippet || '');
      const title = cleanText(r.title || '');
      if (content.length > 50 && concepts.length < 6) {
        concepts.push({
          name: title.slice(0, 45) || `Concept ${concepts.length + 1}`,
          description: getSentences(content, 2)
        });
      }
      if (content.length > 40) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
        sentences.slice(0, 2).forEach(s => {
          if (facts.length < 15) facts.push(s.trim() + '.');
        });
      }
      if (r.url && articles.length < 6) {
        articles.push({ title: title.slice(0, 60) || 'Article', url: r.url, source: 'Tavily' });
      }
    });
  }

  return { concepts, facts, articles };
};

// Parse Google
const parseGoogle = (items) => {
  const facts = [];
  const articles = [];
  items.forEach(item => {
    const title = cleanText(item.title || '');
    const snippet = cleanText(item.snippet || '');
    if (snippet.length > 30) {
      const sentences = snippet.split(/[.!?]+/).filter(s => s.trim().length > 30);
      sentences.slice(0, 2).forEach(s => {
        if (facts.length < 15) facts.push(s.trim() + '.');
      });
    }
    if (item.link && articles.length < 6) {
      articles.push({ title: title.slice(0, 60) || 'Article', url: item.link, source: 'Google' });
    }
  });
  return { facts, articles };
};

// Main function
export const generateTopicContent = async (topicId, topicTitle, onProgress) => {
  // Check cache
  const cached = localStorage.getItem(`topic_${topicId}`);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.log('Cache parse error');
    }
  }

  console.log('Searching for:', topicTitle);
  if (onProgress) onProgress('🔍 Researching...');

  let overview = '';
  let concepts = [];
  let facts = [];
  let articles = [];

  try {
    const [duckData, tavilyData, googleItems] = await Promise.all([
      searchDuckDuckGo(topicTitle),
      searchTavily(topicTitle),
      searchGoogle(topicTitle)
    ]);

    // DuckDuckGo
    if (duckData) {
      const parsed = parseDuckDuckGo(duckData);
      overview = parsed.overview || overview;
      parsed.concepts.forEach(c => { if (concepts.length < 6) concepts.push(c); });
      parsed.facts.forEach(f => { if (facts.length < 12) facts.push(f); });
      parsed.articles.forEach(a => { if (articles.length < 6) articles.push(a); });
    }

    // Tavily
    if (tavilyData) {
      if (tavilyData.answer && !overview) {
        overview = getSentences(cleanText(tavilyData.answer), 4);
      }
      const parsed = parseTavily(tavilyData);
      parsed.concepts.forEach(c => { if (concepts.length < 8) concepts.push(c); });
      parsed.facts.forEach(f => { if (facts.length < 15) facts.push(f); });
      parsed.articles.forEach(a => { if (articles.length < 6) articles.push(a); });
    }

    // Google
    if (googleItems.length > 0) {
      const parsed = parseGoogle(googleItems);
      parsed.facts.forEach(f => { if (facts.length < 15) facts.push(f); });
      parsed.articles.forEach(a => { if (articles.length < 6) articles.push(a); });
    }

    // Ensure overview
    if (!overview || overview.length < 30) {
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
      overview: overview.slice(0, 1200),
      timeline: [],
      concepts: concepts.slice(0, 8).map(c => ({
        name: c.name.slice(0, 50),
        description: c.description.slice(0, 300)
      })),
      facts: facts.slice(0, 15),
      articles: articles.slice(0, 6),
      relatedTopics: ['Black Holes', 'Ancient Egypt', 'Artificial Intelligence', 'Deep Ocean', 'Solar System'],
      recommendations: [
        { title: 'Explore More Topics', type: 'article', description: 'Continue your journey of discovery.' }
      ]
    };

    try {
      localStorage.setItem(`topic_${topicId}`, JSON.stringify(content));
    } catch (e) {
      console.log('Cache save error');
    }

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
