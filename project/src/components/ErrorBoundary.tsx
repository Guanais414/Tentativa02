import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for debugging; in production this would go to a service
    console.error('App crashed:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleHardReset = () => {
    // Clear potentially corrupted local data and reload
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith('lifeflow_'));
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-5 bg-gradient-to-br from-green-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-sm text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <AlertCircle size={32} className="text-amber-500" />
            </div>
            <h1 className="text-xl font-extrabold mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              The app hit an unexpected error. You can try again, or reset your local data if the problem persists.
            </p>
            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-green-500 text-white font-bold py-3 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} /> Try Again
              </button>
              <button
                onClick={this.handleHardReset}
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 font-bold py-3 rounded-2xl active:scale-95 transition-transform"
              >
                Reset App Data
              </button>
            </div>
            {this.state.error && (
              <p className="text-xs text-gray-400 mt-4 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
