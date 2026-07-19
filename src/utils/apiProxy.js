// This file handles all API calls with proper error handling
import axios from 'axios';

const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX;

// DuckDuckGo - works on all devices (no CORS issues)
export const searchDuckDuckGo = async (query) => {
  try {
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: { 
        q: query, 
        format: 'json', 
        no_html: 1, 
        skip_disambig: 1 
      },
      timeout: 8000,
      headers: {
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (e) {
    console.error('DuckDuckGo error:', e.message);
    return null;
  }
};

// Tavily - with fallback
export const searchTavily = async (query) => {
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
        headers: { 
          'Authorization': `Bearer ${TAVILY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000
      }
    );
    return response.data;
  } catch (e) {
    console.error('Tavily error:', e.message);
    return null;
  }
};

// Google - with fallback
export const searchGoogle = async (query) => {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) return [];
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: { 
        key: GOOGLE_API_KEY, 
        cx: GOOGLE_CX, 
        q: query, 
        num: 5 
      },
      timeout: 8000
    });
    return response.data.items || [];
  } catch (e) {
    console.error('Google error:', e.message);
    return [];
  }
};

// Combined search with fallback
export const searchAll = async (query) => {
  // Try DuckDuckGo first (most reliable)
  const duckResult = await searchDuckDuckGo(query);
  if (duckResult && duckResult.AbstractText) {
    return { success: true, source: 'duckduckgo', data: duckResult };
  }

  // Try Tavily
  const tavilyResult = await searchTavily(query);
  if (tavilyResult && tavilyResult.answer) {
    return { success: true, source: 'tavily', data: tavilyResult };
  }

  // Try Google
  const googleResult = await searchGoogle(query);
  if (googleResult && googleResult.length > 0) {
    return { success: true, source: 'google', data: googleResult };
  }

  return { success: false };
};
