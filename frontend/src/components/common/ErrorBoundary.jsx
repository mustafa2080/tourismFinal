import React from 'react';

/**
 * Error Boundary Component
 * Catches errors and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state after catching error
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Log error details
   */
  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // Could send to error tracking service here
    // e.g., Sentry, Rollbar, etc.
  }

  /**
   * Reset error state
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback(error, this.resetError);
      }

      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">
              An unexpected error occurred. Please try again.
            </p>

            {showDetails && error && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre className="error-stack">
                  {error.toString()}
                  {errorInfo && errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              className="error-reset-btn"
              onClick={this.resetError}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

/**
 * Usage Examples:
 * 
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <h1>Error: {error.message}</h1>
 *       <button onClick={reset}>Retry</button>
 *     </div>
 *   )}
 * >
 *   <ComplexComponent />
 * </ErrorBoundary>
 * 
 * <ErrorBoundary showDetails>
 *   <App />
 * </ErrorBoundary>
 */
