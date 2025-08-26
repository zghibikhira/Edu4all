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
    // eslint-disable-next-line no-console
    console.error('UI ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-xl w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow">
            <h1 className="text-2xl font-bold mb-2">Une erreur est survenue</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Merci de recharger la page. Si le problème persiste, contactez le support.
            </p>
            <pre className="text-xs whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700 overflow-auto max-h-60">{String(this.state.error)}</pre>
            <div className="mt-4 flex gap-2">
              <button onClick={() => window.location.reload()} className="btn-primary">Recharger</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


