import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SyntaxHub application error:", error, info);
  }

  handleReload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="app-error-page">
        <section className="app-error-card" role="alert">
          <p className="section-label">SOMETHING WENT WRONG</p>
          <h1>We couldn't load this page.</h1>
          <p>Please refresh and try again. Your account and saved data are safe.</p>
          <button type="button" onClick={this.handleReload}>Refresh Page</button>
        </section>
      </main>
    );
  }
}
