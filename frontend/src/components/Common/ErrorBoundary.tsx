import { Component, type ErrorInfo, type ReactNode } from "react";
import { FaExclamationTriangle, FaRedo, FaHome } from "react-icons/fa";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ResQNet Application Error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-black/[0.08] text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
              <FaExclamationTriangle />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Something went wrong
            </h1>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              An unexpected error occurred in the ResQNet interface. Emergency services and background coordinators remain active.
            </p>
            {this.state.error?.message && (
              <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-black/[0.04] text-[11px] font-mono text-gray-600 truncate text-left">
                {this.state.error.message}
              </div>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
              >
                <FaRedo className="text-[10px]" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <FaHome className="text-[11px]" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
