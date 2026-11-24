import type { ReactNode } from 'react';
import { useNav } from '../app/nav';
import { useT } from '../i18n';

/**
 * Top bar: ← goes to the screen's parent (see app/nav.ts), the title, the screen's own actions,
 * then 🏠 back to the home page (on every screen but the home page — kiểu H2 on the mock).
 */
export function TopBar({
  title,
  onBack,
  right,
  onTitleTap,
  noBack,
  left,
}: {
  title: string;
  noBack?: boolean;
  left?: ReactNode;
  /** replaces the plain "go to parent" (e.g. to ask before leaving a form) */
  onBack?: () => void;
  right?: ReactNode;
  onTitleTap?: () => void;
}) {
  const t = useT();
  const nav = useNav();
  const showHome = nav.parent !== null;
  return (
    <header className="topbar">
      {!noBack && nav.parent !== null ? (
        <button
          className="icon-btn"
          aria-label={t('back')}
          data-testid="nav-back"
          onClick={() => (onBack ? onBack() : nav.up())}
        >
          ⬅️
        </button>
      ) : (
        (left ?? <span style={{ width: 'var(--tap)' }} />)
      )}
      <h1 onClick={onTitleTap}>{title}</h1>
      {right || showHome ? (
        <div className="topbar-actions">
          {right}
          {showHome && (
            <button
              className="icon-btn"
              aria-label={t('home')}
              data-testid="nav-home"
              onClick={nav.home}
            >
              🏠
            </button>
          )}
        </div>
      ) : (
        <span style={{ width: 'var(--tap)' }} />
      )}
    </header>
  );
}

export function Card({
  emoji,
  title,
  hint,
  onClick,
  className = '',
  testId,
}: {
  emoji: string;
  title: string;
  hint?: string;
  onClick: () => void;
  className?: string;
  testId?: string;
}) {
  return (
    <button className={`card ${className}`} data-testid={testId} onClick={onClick}>
      <span className="emoji" aria-hidden>
        {emoji}
      </span>
      <span>
        <div className="title">{title}</div>
        {hint ? <div className="hint">{hint}</div> : null}
      </span>
    </button>
  );
}

export function Modal({ children, onClose }: { children: ReactNode; onClose?: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/** "Discard changes?" confirmation so a stray tap on Back doesn't lose a half-filled form. */
export function DiscardConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useT();
  return (
    <Modal onClose={onCancel}>
      <h2>{t('discardConfirm')}</h2>
      <div className="stack">
        <button className="btn" onClick={onCancel} data-testid="keep-editing">
          ✏️ {t('keepEditing')}
        </button>
        <button className="btn secondary" onClick={onConfirm} data-testid="confirm-discard">
          🗑️ {t('discard')}
        </button>
      </div>
    </Modal>
  );
}
