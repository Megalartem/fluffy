"use client";

import { Component, ReactNode } from "react";

/**
 * Error Boundary - catches React component errors
 *
 * Handles:
 * - Render errors in child components
 * - Event handler errors (with error boundary wrapper)
 * - Error logging and reporting
 * - Graceful UI fallback
 */

export interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught error:", error, errorInfo);
    }

    // Store error info
    this.setState({ errorInfo });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md">
            <h1 className="text-2xl font-semibold text-red-600 mb-2">
              Что-то пошло не так
            </h1>
            <p className="text-gray-600 mb-4">
              Приложение встретило ошибку и не может продолжить работу.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-500 font-mono">
                  Детали ошибки (dev only)
                </summary>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40 text-red-600">
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.reset}
                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-700"
              >
                Попробовать снова
              </button>
              <button
                onClick={() => window.location.href = "/"}
                className="flex-1 bg-gray-200 text-gray-800 rounded-lg px-4 py-2 font-semibold hover:bg-gray-300"
              >
                На главную
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withErrorBoundary - HOC to wrap component with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    onError?: (error: Error, errorInfo: { componentStack: string }) => void;
    fallback?: ReactNode;
  }
) {
  const Wrapped = (props: P) => (
    <ErrorBoundary onError={options?.onError} fallback={options?.fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  Wrapped.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;

  return Wrapped;
}

/**
 * Utility to wrap async operations with error handling
 */
export async function wrapAsync<T>(
  fn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    } else if (process.env.NODE_ENV === "development") {
      console.error("Async error:", err);
    }
    return null;
  }
}
