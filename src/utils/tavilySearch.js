const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;

export const generateContentFromTavily = async (topicId, topicTitle) => {
  // Check cache first
  const cached = localStorage.getItem(`topic_${topicId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  try {
    // Use Tavily API directly with fetch
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query: topicTitle,
        search_depth: 'basic',
        max_results: 10,
        include_answer: true
      })
    });

    if (!response.ok) {
      throw new Error('Tavily API error');
    }

    const data = await response.json();
    
    // Structure the content
    const content = {
      title: topicTitle,
      icon: '🔍',
      subtitle: 'AI-researched from Tavily',
      overview: data.answer || data.results.map(r => r.content || r.title).join(' '),
      concepts: data.results.slice(0, 6).map((r, i) => ({
        name: r.title || `Source ${i+1}`,
        description: r.content || r.snippet || 'Learn more at this source'
      })),
      facts: data.results.slice(0, 8).map((r) => 
        `${r.title}: ${(r.content || r.snippet || '').substring(0, 150)}...`
      ),
      recommendations: data.results.slice(0, 3).map((r) => ({
        title: r.title,
        type: 'article',
        description: r.content || r.snippet || 'Click to learn more'
      })),
      timeline: [],
      relatedTopics: []
    };
    
    // Cache the result
    localStorage.setItem(`topic_${topicId}`, JSON.stringify(content));
    return content;
  } catch (error) {
    console.error('Tavily error:', error);
    throw error;
  }
};
