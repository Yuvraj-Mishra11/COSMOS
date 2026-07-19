import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌌</div>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: 300,
        letterSpacing: '0.1em',
        marginBottom: '0.5rem'
      }}>
        404
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: '#888899',
        marginBottom: '2rem'
      }}>
        This cosmic destination is yet to be discovered
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#888899',
          padding: '0.8rem 2rem',
          borderRadius: '50px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
          e.target.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
          e.target.style.color = '#888899';
        }}
      >
        ← Return Home
      </button>
    </div>
  );
};

export default NotFound;
