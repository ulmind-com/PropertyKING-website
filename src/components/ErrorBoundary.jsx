import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Check if it's a chunk loading error (lazy import failure)
      const isChunkError = this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed');

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', gap: '16px', padding: '40px 20px', textAlign: 'center',
          fontFamily: 'Raleway, sans-serif'
        }}>
          <div style={{ fontSize: '48px' }}>{isChunkError ? '📡' : '⚠️'}</div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {isChunkError ? 'Connection Issue' : 'Something went wrong'}
          </h2>
          <p style={{ fontSize: '14px', color: '#888', maxWidth: '400px', lineHeight: 1.6 }}>
            {isChunkError
              ? 'Failed to load the page. This usually happens due to a slow connection or a new update. Try refreshing.'
              : 'An unexpected error occurred. Please try again.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button onClick={this.handleRetry} style={{
              padding: '10px 24px', borderRadius: '12px', border: '1px solid #e0e0e0',
              background: '#fff', color: '#333', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Raleway, sans-serif'
            }}>
              Try Again
            </button>
            <button onClick={this.handleReload} style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none',
              background: '#1a1a1a', color: '#fff', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Raleway, sans-serif'
            }}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
