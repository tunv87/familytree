import { Component, type ReactNode } from 'react';
import { t } from '../i18n';
import { createLogger } from '../lib/logger';

const log = createLogger('crash');

/** Shows a friendly screen instead of a blank page if a screen crashes. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    log.error(error.message, {
      stack: error.stack?.slice(0, 600),
      where: info.componentStack?.slice(0, 400),
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="screen center" data-testid="crash">
        <div style={{ fontSize: '3em' }} aria-hidden>
          😥
        </div>
        <h2>{t('crashTitle')}</h2>
        <div className="muted">{t('crashHint')}</div>
        <button
          className="btn"
          onClick={() => {
            location.hash = '#/';
            this.setState({ failed: false });
          }}
        >
          🏠 {t('home')}
        </button>
        <button
          className="btn secondary"
          onClick={() => {
            location.hash = '#/debug';
            this.setState({ failed: false });
          }}
        >
          🪵 {t('debug')}
        </button>
      </main>
    );
  }
}
