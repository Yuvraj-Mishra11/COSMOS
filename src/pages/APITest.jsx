import { useState } from 'react';

const APITest = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (name, url, options) => {
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      return { status: '✅ Working', data };
    } catch (e) {
      return { status: '❌ Failed', error: e.message };
    }
  };

  const runTests = async () => {
    setLoading(true);
    const newResults = {};

    // Test DeepSeek
    newResults.deepseek = await testAPI(
      'DeepSeek',
      'https://api.deepseek.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Say hello' }],
          max_tokens: 5
        })
      }
    );

    // Test Tavily
    newResults.tavily = await testAPI(
      'Tavily',
      'https://api.tavily.com/search',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_TAVILY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'test',
          search_depth: 'basic',
          max_results: 1
        })
      }
    );

    // Test Google
    const googleKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const googleCX = import.meta.env.VITE_GOOGLE_CX;
    if (googleKey && googleCX) {
      newResults.google = await testAPI(
        'Google',
        `https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCX}&q=test&num=1`,
        { method: 'GET' }
      );
    } else {
      newResults.google = { status: '⚠️ Keys Missing' };
    }

    setResults(newResults);
    setLoading(false);
  };

  return (
    <div style={{
      background: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300 }}>API Test</h1>
      
      <button
        onClick={runTests}
        disabled={loading}
        style={{
          background: loading ? '#333' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          padding: '0.8rem 2rem',
          borderRadius: '50px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontFamily: 'Inter, sans-serif',
          margin: '1rem 0'
        }}
      >
        {loading ? 'Testing...' : 'Run Tests'}
      </button>

      <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {Object.entries(results).map(([key, value]) => (
          <div key={key} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              {key.toUpperCase()}: {value.status}
            </h3>
            {value.error && (
              <p style={{ color: '#ff6b6b', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                Error: {value.error}
              </p>
            )}
            {value.data && (
              <pre style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '0.5rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: '#aaa',
                overflow: 'auto',
                maxHeight: '150px'
              }}>
                {JSON.stringify(value.data, null, 2).slice(0, 500)}
              </pre>
            )}
          </div>
        ))}
      </div>

      {!loading && Object.keys(results).length === 0 && (
        <p style={{ color: '#666', marginTop: '2rem' }}>
          Click "Run Tests" to check your API keys
        </p>
      )}
    </div>
  );
};

export default APITest;
