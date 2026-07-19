const LoadingSpinner = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      background: '#0a0a0a'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '2px solid rgba(255,255,255,0.1)',
        borderTop: '2px solid #ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
