import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
}

export class ChartErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      errorInfo: null 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <TrendingDown className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {this.props.fallbackTitle || 'Chart Error'}
              </h3>
              <p className="text-red-600 mb-4">
                Something went wrong while loading this chart.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-4 p-4 bg-red-100 rounded-lg">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <div className="text-sm text-red-700 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 p-2 bg-red-200 rounded text-xs overflow-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {(this.props.showRetryButton !== false) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={this.handleRetry}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  const resetError = () => setError(null);
  
  const handleError = React.useCallback((error: Error) => {
    console.error('Chart error:', error);
    setError(error);
  }, []);
  
  React.useEffect(() => {
    if (error) {
      // Log error to monitoring service
      console.error('Chart component error:', error);
    }
  }, [error]);
  
  return { error, handleError, resetError };
};

// Higher-order component version
export const withChartErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackTitle?: string
) => {
  const WithErrorBoundary = (props: P) => (
    <ChartErrorBoundary fallbackTitle={fallbackTitle}>
      <WrappedComponent {...props} />
    </ChartErrorBoundary>
  );
  
  WithErrorBoundary.displayName = `withChartErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundary;
};
