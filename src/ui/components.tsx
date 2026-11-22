import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';

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
  onBack?: () => void;
  right?: ReactNode;
  onTitleTap?: () => void;
}) {
  const t = useT();
  const navigate = useNavigate();
  return (
    <header className="topbar">
      {!noBack ? (
        <button
          className="icon-btn"
          aria-label={t('back')}
          onClick={() => (onBack ? onBack() : navigate(-1))}
        >
          ⬅️
        </button>
      ) : (
        (left ?? <span style={{ width: 'var(--tap)' }} />)
      )}
      <h1 onClick={onTitleTap}>{title}</h1>
      {right ?? <span style={{ width: 'var(--tap)' }} />}
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
