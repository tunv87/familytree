import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { shareUrl, type CurrentFamily } from '../data/current';
import { renameFamily, setTopGeneration } from '../data/families';
import { topGenerationOf } from '../data/generations';
import { useT } from '../i18n';
import { createLogger } from '../lib/logger';
import { TopBar } from '../ui/components';
import { showToast } from '../ui/toast';
import { FamilyGate } from './useFamilyGate';

const log = createLogger('invite');

export function InviteScreen() {
  const t = useT();
  return <FamilyGate title={t('invite')}>{(fam) => <Invite fam={fam} />}</FamilyGate>;
}

function Invite({ fam }: { fam: CurrentFamily & { isAdmin: boolean } }) {
  const t = useT();
  const url = shareUrl(fam.id!);
  const name = fam.family!.meta.name;
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' })
      .then(setQr)
      .catch((e) => log.error('qr failed', e));
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // some in-app browsers (Zalo, Messenger) block the clipboard: say so, and select the
      // link so a long-press "Copy" works (B-17)
      log.warn('copy failed', String(e));
      showToast(t('copyFailed'));
      const box = document.querySelector('[data-testid="share-url"]');
      if (box) window.getSelection()?.selectAllChildren(box);
    }
  };
  const share = async () => {
    const text = t('shareText', { name });
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text, url });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        log.warn('share failed', String(e));
      }
    }
    await copy();
  };

  return (
    <main className="screen">
      <TopBar title={t('invite')} />
      <div className="center">
        <h2 className="invite-name">{name}</h2>
        <div className="muted">{t('scanHint')}</div>
        <div
          className="qr"
          data-testid="qr"
          role="img"
          aria-label={t('qrLabel')}
          dangerouslySetInnerHTML={{ __html: qr }}
        />
      </div>
      <button className="btn" data-testid="share" onClick={share}>
        📨 {t('sendLink')}
      </button>
      <button className="btn secondary" data-testid="copy-link" onClick={copy}>
        📋 {copied ? t('copied') : t('copyLink')}
      </button>
      <div className="link-box" data-testid="share-url">
        {url}
      </div>
      <div className="help-card">
        <b>{t('howToOpen')}</b>
        <ol>
          <li>{t('howTo1')}</li>
          <li>{t('howTo2')}</li>
          <li>{t('howTo3')}</li>
        </ol>
      </div>
      {fam.isAdmin && <RenameFamily familyId={fam.id!} name={name} />}
      {fam.isAdmin && fam.family && (
        <TopGeneration familyId={fam.id!} current={topGenerationOf(fam.family)} />
      )}
    </main>
  );
}

function RenameFamily({ familyId, name }: { familyId: string; name: string }) {
  const t = useT();
  const [value, setValue] = useState(name);
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const valid = value.trim().length > 0 && value.trim().length <= 80 && value.trim() !== name;
  return (
    <form
      className="field"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid) return;
        setState('saving');
        try {
          await renameFamily(familyId, value.trim());
          setState('saved');
        } catch (err) {
          log.error('rename failed', err);
          setState('error');
        }
      }}
    >
      <span>{t('familyName')}</span>
      <div className="inline-form">
        <input
          className="text-input"
          value={value}
          maxLength={80}
          aria-label={t('familyName')}
          data-testid="rename-input"
          onChange={(e) => {
            setValue(e.target.value);
            setState('idle');
          }}
        />
        <button className="btn" disabled={!valid || state === 'saving'} data-testid="rename">
          {state === 'saved' ? '✓' : t('save')}
        </button>
      </div>
      {state === 'error' && <div className="error">{t('saveError')}</div>}
    </form>
  );
}

/** For a branch of a bigger clan: the oldest person here is generation N of the whole clan. */
function TopGeneration({ familyId, current }: { familyId: string; current: number }) {
  const t = useT();
  const [value, setValue] = useState(String(current));
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const n = Number(value);
  const valid = Number.isInteger(n) && n >= 1 && n <= 60 && n !== current;
  return (
    <form
      className="field"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid) return;
        setState('saving');
        try {
          await setTopGeneration(familyId, n);
          setState('saved');
        } catch (err) {
          log.error('top generation failed', err);
          setState('error');
        }
      }}
    >
      <label htmlFor="top-generation">{t('topGeneration')}</label>
      <div className="inline-form">
        <input
          id="top-generation"
          className="text-input short"
          inputMode="numeric"
          maxLength={2}
          value={value}
          aria-describedby="top-generation-hint"
          data-testid="top-generation"
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ''));
            setState('idle');
          }}
        />
        <button
          className="btn"
          disabled={!valid || state === 'saving'}
          data-testid="save-top-generation"
        >
          {state === 'saved' ? '✓' : t('save')}
        </button>
      </div>
      <span className="muted small" id="top-generation-hint">
        {t('topGenerationHint')}
      </span>
      {state === 'error' && <div className="error">{t('saveError')}</div>}
    </form>
  );
}
