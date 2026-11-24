import { useState, useSyncExternalStore } from 'react';
import { useT } from '../i18n';
import { clearLogs, formatLogs, getLogs, subscribeLogs } from '../lib/logger';
import { TopBar } from '../ui/components';
import { isFirebaseConfigured } from '../data/firebase';

export function DebugScreen() {
  const t = useT();
  const logs = useSyncExternalStore(subscribeLogs, () => getLogs().length);
  const [copied, setCopied] = useState(false);
  const header = [
    `version ${__APP_VERSION__} built ${__BUILD_TIME__}`,
    `firebase configured: ${isFirebaseConfigured}`,
    `ua: ${navigator.userAgent}`,
    `screen: ${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio}`,
  ].join('\n');
  const text = `${header}\n\n${formatLogs()}`;
  return (
    <main className="screen">
      <TopBar title={t('debug')} />
      <pre className="log-view" data-count={logs}>
        {text}
      </pre>
      <div className="action-bar">
        <div className="players">
          <button
            className="btn grow"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            📋 {copied ? t('copied') : t('copyLogs')}
          </button>
          <button className="btn secondary" onClick={clearLogs}>
            🗑️ {t('clearLogs')}
          </button>
        </div>
      </div>
    </main>
  );
}
