import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarBackground from '../components/StarBackground';
import CursorParticles from '../components/CursorParticles';

const topics = [
  { id: 'black-holes', title: 'Black Holes', desc: 'The most mysterious objects in space' },
  { id: 'ancient-egypt', title: 'Ancient Egypt', desc: 'Pyramids, pharaohs, and early civilization' },
  { id: 'artificial-intelligence', title: 'Artificial Intelligence', desc: 'The future of machine learning and networks' },
  { id: 'deep-ocean', title: 'Deep Ocean', desc: 'The unexplored depths of our own planet' },
  { id: 'solar-system', title: 'Solar System', desc: 'Our planetary neighbors and their moons' },
  { id: 'quantum-physics', title: 'Quantum Physics', desc: 'The bizarre laws governing the subatomic' },
];

const LandingPage = () => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const popularTopics = [
    'Black Holes',
    'Ancient Egypt',
    'Artificial Intelligence',
    'Deep Ocean',
    'Solar System',
    'Quantum Physics',
    'Nikola Tesla',
    'Mars',
    'Dinosaurs',
    'The Renaissance',
    'Climate Change',
    'The Roman Empire',
    'Space Exploration',
    'Genetics',
    'The Cold War',
    'Ancient Greece',
    'The Internet',
    'Nuclear Physics',
    'The Human Brain',
    'Gravity',
    'Light',
    'Time',
    'Stars',
    'Galaxies',
    'Planets'
  ];

  // Generate stars once
  const [stars] = useState(() => 
    Array.from({ length: 30 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2
    }))
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const topicId = searchQuery.toLowerCase().trim().replace(/\s+/g, '-');
      navigate(`/topic/${topicId}`);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 0) {
      const filtered = popularTopics.filter(topic =>
        topic.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (topic) => {
    setSearchQuery(topic);
    setShowSuggestions(false);
    const topicId = topic.toLowerCase().replace(/\s+/g, '-');
    navigate(`/topic/${topicId}`);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <StarBackground />
      <CursorParticles />
      <div className="min-h-screen relative overflow-x-hidden selection:bg-white/20" style={{ position: 'relative', zIndex: 1, backgroundColor: 'transparent', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bg-gradient-shift {
          background: linear-gradient(135deg, rgba(10,10,10,1) 0%, rgba(20,20,30,0.8) 50%, rgba(10,10,10,1) 100%);
          background-size: 200% 200%;
          animation: gradientShift 10s ease infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Background Gradient & Stars */}
      <div className="absolute inset-0 z-0 bg-gradient-shift"></div>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: 0.2,
              animation: `twinkle ${star.duration}s infinite ease-in-out ${star.delay}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 min-h-screen flex flex-col items-center justify-center">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 
            onClick={() => navigate('/')}
            className={`animate-float cursor-pointer text-white font-light mb-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              fontSize: '4rem',
              fontWeight: 300,
              letterSpacing: '0.3em',
              textShadow: '0 0 20px rgba(255,255,255,0.05)',
              marginRight: '-0.3em' // offset letter spacing for true center
            }}
          >
            COSMOS
          </h1>
          <p 
            className={`transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              color: '#a8a8b8',
              fontSize: '1.1rem',
              fontWeight: 300,
              letterSpacing: '0.1em'
            }}
          >
            Explore the Universe of Knowledge.
          </p>
        </header>

        {/* Search */}
        <div 
          className={`w-full flex justify-center mb-16 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '50px',
              padding: '0.5rem 1.5rem',
              transition: 'all 0.3s ease',
              position: 'relative',
              width: '100%'
            }}>
              <input
                type="text"
                placeholder="Search any topic..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontSize: '1rem',
                  padding: '0.8rem 0',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
              <button
                type="submit"
                className="bg-transparent border-none text-[#888899] cursor-pointer text-xl hover:text-white transition-colors"
                style={{ padding: '0.5rem' }}
              >
                🔍
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: 'rgba(20,20,30,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  zIndex: 100,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  padding: '0.5rem 0'
                }}>
                  {suggestions.map((topic, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(topic)}
                      style={{
                        padding: '0.7rem 1.5rem',
                        color: '#d0d0d8',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.05)';
                        e.target.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                        e.target.style.color = '#d0d0d8';
                      }}
                    >
                      <span style={{ fontSize: '1rem', opacity: 0.4 }}>🔍</span>
                      {topic}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mb-auto">
          {topics.map((topic, i) => (
            <div 
              key={topic.id}
              onClick={() => navigate(`/topic/${topic.id}`)}
              className="cursor-pointer flex flex-col group transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '16px',
                padding: '1.8rem',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: mounted ? 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : `all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) ${300 + i * 100}ms`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(255,255,255,0.05)';
                const icon = e.currentTarget.querySelector('.topic-icon');
                if (icon) {
                  icon.style.background = 'rgba(255,255,255,0.12)';
                  icon.style.borderColor = 'rgba(255,255,255,0.2)';
                  icon.style.boxShadow = '0 0 30px rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.boxShadow = 'none';
                const icon = e.currentTarget.querySelector('.topic-icon');
                if (icon) {
                  icon.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))';
                  icon.style.borderColor = 'rgba(255,255,255,0.06)';
                  icon.style.boxShadow = 'none';
                }
              }}
            >
              <div className="topic-icon" style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 300,
                color: '#ffffff',
                marginBottom: '0.8rem',
                transition: 'all 0.4s ease',
                fontFamily: 'Inter, sans-serif'
              }}>
                {topic.title.charAt(0).toUpperCase()}
              </div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '0.5rem'
              }}>
                {topic.title}
              </h3>
              <p style={{
                fontSize: '0.9rem',
                color: '#a8a8b8',
                lineHeight: '1.5'
              }}>
                {topic.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer 
          className={`text-center transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          style={{ marginTop: '3rem' }}
        >
          <div style={{
            color: '#444455',
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
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
        </footer>
      </div>
    </div>
    </>
  );
};

export default LandingPage;
