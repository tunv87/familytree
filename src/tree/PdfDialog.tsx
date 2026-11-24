import { useState } from 'react';
import type { People } from '../data/people';
import { useT } from '../i18n';
import { createLogger } from '../lib/logger';
import { Modal } from '../ui/components';
import { useThumbs } from '../data/photos';
import { CARD_W, layoutTree, PHOTO_CARD_W } from './layout';
import { planPdf, type Paper, type PdfMode } from './pdfPlan';

const log = createLogger('pdf-dialog');

export function PdfDialog({
  people,
  rootId,
  title,
  onClose,
}: {
  people: People;
  rootId?: string;
  title: string;
  onClose: () => void;
}) {
  const t = useT();
  const [paper, setPaper] = useState<Paper>('a4');
  const [mode, setMode] = useState<PdfMode>('auto');
  // "Có ảnh" by default (the family's choice); the cards are wider then
  const [withPhotos, setWithPhotos] = useState(true);
  const thumbs = useThumbs();
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const layout = layoutTree(people, { rootId, cardW: withPhotos ? PHOTO_CARD_W : CARD_W });
  const plan = planPdf(layout.width, layout.height, paper, mode);

  const make = async () => {
    setError(false);
    setProgress(t('pdfWorking'));
    try {
      // jsPDF is big: load it only when someone actually prints
      const { exportTreePdf } = await import('./exportPdf');
      const { blob } = await exportTreePdf({
        people,
        rootId,
        title,
        paper,
        mode,
        withPhotos,
        thumbs,
        onProgress: (d, n) => setProgress(t('pdfProgress', { d, n })),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gia-pha-${slug(title)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setProgress(null);
      onClose();
    } catch (e) {
      log.error('pdf failed', e);
      setError(true);
      setProgress(null);
    }
  };

  return (
    <Modal onClose={progress ? undefined : onClose}>
      <h2>🖨️ {t('printPdf')}</h2>
      <div className="field">
        <span>{t('paper')}</span>
        <div className="segmented">
          {(['a4', 'a3'] as const).map((p) => (
            <button
              key={p}
              aria-pressed={paper === p}
              data-testid={`paper-${p}`}
              onClick={() => setPaper(p)}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span>{t('layoutMode')}</span>
        <div className="segmented wrap">
          {(
            [
              ['auto', t('modeAuto')],
              ['one', t('modeOne')],
              ['tiles', t('modeTiles')],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              aria-pressed={mode === m}
              data-testid={`mode-${m}`}
              onClick={() => setMode(m)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span>{t('pdfContent')}</span>
        <div className="segmented">
          <button
            aria-pressed={!withPhotos}
            data-testid="pdf-names-only"
            onClick={() => setWithPhotos(false)}
          >
            {t('pdfNamesOnly')}
          </button>
          <button
            aria-pressed={withPhotos}
            data-testid="pdf-with-photos"
            onClick={() => setWithPhotos(true)}
          >
            {t('pdfWithPhotos')}
          </button>
        </div>
      </div>
      <div className="muted" data-testid="pdf-estimate">
        {plan.pages.length === 1
          ? t('pdfOneSheet', { paper: paper.toUpperCase() })
          : t('pdfSheets', {
              n: plan.pages.length,
              rows: plan.rows,
              cols: plan.cols,
              paper: paper.toUpperCase(),
            })}
      </div>
      {error && <div className="error">{t('pdfError')}</div>}
      <button className="btn" disabled={Boolean(progress)} data-testid="make-pdf" onClick={make}>
        {progress ?? `📄 ${t('makePdf')}`}
      </button>
    </Modal>
  );
}

function slug(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/gi, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'cay'
  );
}
