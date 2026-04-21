import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = "/";
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-500 mb-2">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
              <p className="text-slate-400 text-sm">
                The Glimmer encountered an unexpected distortion. We've logged the error and are working to stabilize the ink.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/40 rounded-lg p-4 text-left overflow-auto max-h-32 mb-4">
                <code className="text-xs text-red-400 font-mono">
                  {this.state.error.message}
                </code>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={this.handleReset}
                className="border-white/10 hover:bg-white/5 text-slate-300"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button 
                onClick={this.handleReload}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
