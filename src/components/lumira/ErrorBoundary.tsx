import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", color: "#F87171", background: "#181A22", fontFamily: "monospace", minHeight: "100vh" }}>
          <h2>Application Rendering Error</h2>
          <pre style={{ whiteSpace: "pre-wrap", background: "#262833", padding: "12px", borderRadius: "8px", marginTop: "12px" }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", color: "#9CA3AF", fontSize: "11px", marginTop: "12px" }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: "16px", padding: "8px 16px", background: "#5B5FEF", color: "white", borderRadius: "8px", border: "none", cursor: "pointer" }}
          >
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
