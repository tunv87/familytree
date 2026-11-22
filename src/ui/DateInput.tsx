import { dateError, otherCalendarText } from '../data/dates';
import type { FamilyDate } from '../data/types';
import { useT } from '../i18n';

const num = (v: string) =>
  v.trim() === '' ? undefined : Number(v.replace(/\D/g, '')) || undefined;

/** Day / month / year with a solar–lunar switch; any part may be left empty. */
export function DateInput({
  value,
  onChange,
  testId,
}: {
  value: FamilyDate;
  onChange: (d: FamilyDate) => void;
  testId: string;
}) {
  const t = useT();
  const error = dateError(value);
  const other = error ? '' : otherCalendarText(value);
  const set = (patch: Partial<FamilyDate>) => onChange({ ...value, ...patch });
  return (
    <div className="date-input" data-testid={testId}>
      <div className="segmented">
        {(['s', 'l'] as const).map((cal) => (
          <button
            type="button"
            key={cal}
            aria-pressed={value.cal === cal}
            data-testid={`${testId}-${cal}`}
            onClick={() => set({ cal, leap: cal === 'l' ? value.leap : undefined })}
          >
            {cal === 's' ? t('solar') : t('lunar')}
          </button>
        ))}
      </div>
      <div className="dmy">
        {(
          [
            ['d', t('day'), 2],
            ['m', t('month'), 2],
            ['y', t('year'), 4],
          ] as const
        ).map(([k, label, len]) => (
          <label key={k}>
            <span>{label}</span>
            <input
              className="text-input"
              inputMode="numeric"
              maxLength={len}
              value={value[k] ?? ''}
              data-testid={`${testId}-${k}`}
              onChange={(e) => set({ [k]: num(e.target.value) })}
            />
          </label>
        ))}
      </div>
      {value.cal === 'l' && (
        <label className="check">
          <input
            type="checkbox"
            checked={Boolean(value.leap)}
            onChange={(e) => set({ leap: e.target.checked || undefined })}
          />
          {t('leapMonth')}
        </label>
      )}
      {error && <div className="error small">{error}</div>}
      {other && <div className="muted small">= {other}</div>}
    </div>
  );
}
