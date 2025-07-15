import React from 'react';

class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    if (error.name === 'ChunkLoadError') {
      return { hasError: true };
    }
    return null;
  }

  componentDidCatch(error, errorInfo) {
    if (error.name === 'ChunkLoadError') {
      console.log('Chunk loading failed, reloading page...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          backgroundColor: '#f9f9f9',
          margin: '20px',
          borderRadius: '8px'
        }}>
          <h2>Loading Payment Management...</h2>
          <p>Please wait while we refresh the page.</p>
          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;