import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { generateTopicContent } from '../utils/search';
import StarBackground from '../components/StarBackground';

const TopicPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const topics = {
    'black-holes': {
      title: 'Black Holes',
      subtitle: 'The mysterious regions of spacetime',
      overview: 'Black holes are regions of spacetime where gravity is so intense that nothing, not even light, can escape.',
      concepts: [{ name: 'Event Horizon', description: 'The boundary where nothing can escape.' }],
      facts: ['The nearest black hole is 1,500 light-years away.']
    }
  };

  useEffect(() => {
    const loadTopic = async () => {
      if (topics[topicId]) {
        setTopic(topics[topicId]);
        return;
      }

      setIsLoading(true);
      setLoadingMessage('🔍 Starting research...');

      try {
        const aiContent = await generateTopicContent(
          topicId,
          topicId.replace(/-/g, ' '),
          (msg) => setLoadingMessage(msg)
        );
        setTopic(aiContent);
      } catch (error) {
        setTopic({
          title: topicId.replace(/-/g, ' '),
          subtitle: 'Search unavailable',
          overview: 'Please try again later.',
          concepts: [],
          facts: ['Search is temporarily unavailable.']
        });
      }
      setIsLoading(false);
    };

    loadTopic();
  }, [topicId]);

  if (isLoading) {
    return (
      <>
        <StarBackground />
        <div style={{
          background: '#0a0a0a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '2px solid rgba(255,255,255,0.05)',
            borderTop: '2px solid rgba(255,255,255,0.8)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1.5rem'
          }} />
          <p style={{ color: '#888899', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
            {loadingMessage || 'Researching...'}
          </p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </>
    );
  }

  if (!topic) {
    return (
      <>
        <StarBackground />
        <div style={{
          background: '#0a0a0a',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
          zIndex: 1
        }}>
          <p style={{ color: '#888899' }}>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <StarBackground />
      <div style={{
        background: 'transparent',
        color: '#ffffff',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        padding: '2rem 3rem',
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <div style={{
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.015)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          padding: '2rem 3rem',
          position: 'relative',
          overflow: 'hidden'
        }}>

          {/* Inner glow */}
          <div style={{
            position: 'absolute',
            top: '-30%',
            right: '-20%',
            width: '50%',
            height: '70%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.03), transparent 70%)',
            pointerEvents: 'none',
            borderRadius: '50%',
            zIndex: 0
          }} />

          {/* Bottom glow */}
          <div style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '40%',
            height: '50%',
            background: 'radial-gradient(ellipse, rgba(100,150,255,0.02), transparent 70%)',
            pointerEvents: 'none',
            borderRadius: '50%',
            zIndex: 0
          }} />
          
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#555',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.1em',
              padding: '0.5rem 0',
              marginBottom: '1.5rem',
              position: 'relative',
              zIndex: 2,
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#888'}
            onMouseLeave={(e) => e.target.style.color = '#555'}
          >
            ← Back
          </button>

          <div style={{
            padding: '2rem 0 3rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 300,
              color: '#ffffff',
              marginBottom: '1.5rem'
            }}>
              {topic.title?.charAt(0).toUpperCase() || '?'}
            </div>

            <h1 style={{
              fontSize: '4.5rem',
              fontWeight: 200,
              margin: '0 0 0.3rem 0',
              letterSpacing: '-0.02em',
              color: '#ffffff'
            }}>
              {topic.title}
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 300,
              letterSpacing: '0.05em'
            }}>
              {topic.subtitle || 'Explore this topic'}
            </p>
          </div>

          {topic.overview && (
            <div style={{ padding: '3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 2 }}>
              <h2 style={{
                fontSize: '1.2rem',
                fontWeight: 400,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '1.5rem'
              }}>
                Overview
              </h2>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.9',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 300
              }}>
                {topic.overview}
              </p>
            </div>
          )}

          {topic.concepts && topic.concepts.length > 0 && (
            <div style={{ padding: '3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 2 }}>
              <h2 style={{
                fontSize: '1.2rem',
                fontWeight: 400,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '1.5rem'
              }}>
                Key Concepts
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                {topic.concepts.map((item, i) => (
                  <div key={i} style={{
                    padding: '1.2rem 1.5rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.03)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.04)';
                  }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 500, color: '#ffffff', marginBottom: '0.4rem' }}>
                      {item.name}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', fontWeight: 300 }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topic.facts && topic.facts.length > 0 && (
            <div style={{ padding: '3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 2 }}>
              <h2 style={{
                fontSize: '1.2rem',
                fontWeight: 400,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '1.5rem'
              }}>
                Important Facts
              </h2>
              {topic.facts.map((fact, i) => (
                <div key={i} style={{
                  padding: '0.8rem 1.2rem',
                  marginBottom: '0.5rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.03)',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: 400, minWidth: '28px' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', fontWeight: 300 }}>
                    {fact}
                  </span>
                </div>
              ))}
            </div>
          )}

          {topic.articles && topic.articles.length > 0 && (
            <div style={{ padding: '3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 2 }}>
              <h2 style={{
                fontSize: '1.2rem',
                fontWeight: 400,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '1.5rem'
              }}>
                Related Articles
              </h2>
              {topic.articles.map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.8rem 1.2rem',
                    marginBottom: '0.5rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    fontWeight: 300
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.06)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.02)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.04)';
                    e.target.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', minWidth: '70px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {article.source || 'Source'}
                  </span>
                  <span style={{ flex: 1 }}>{article.title}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>→</span>
                </a>
              ))}
            </div>
          )}

          {topic.relatedTopics && topic.relatedTopics.length > 0 && (
            <div style={{ padding: '3rem 0', position: 'relative', zIndex: 2 }}>
              <h2 style={{
                fontSize: '1.2rem',
                fontWeight: 400,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                marginBottom: '1.5rem'
              }}>
                Related Topics
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {topic.relatedTopics.map((t, i) => (
                  <span
                    key={i}
                    onClick={() => navigate(`/topic/${t.toLowerCase().replace(/\s+/g, '-')}`)}
                    style={{
                      padding: '0.4rem 1.2rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '50px',
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 300,
                      letterSpacing: '0.02em'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.08)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                      e.target.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.03)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.target.style.color = 'rgba(255,255,255,0.5)';
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{
            padding: '2rem 0',
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.03)',
            color: 'rgba(255,255,255,0.15)',
            fontSize: '0.8rem',
            fontWeight: 300,
            letterSpacing: '0.1em',
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <span>Knowledge should be explored, not just read.</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em' }}>
              Made by Yuvraj V Mishra
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopicPage;
