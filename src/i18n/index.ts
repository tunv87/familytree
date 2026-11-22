import { useSettings, getSettings, type Lang } from '../app/settings';
import { en } from './en';
import { vi, type MessageKey } from './vi';

export type { MessageKey };

const dicts: Record<Lang, Partial<Record<MessageKey, string>>> = { vi, en };

export function translate(
  lang: Lang,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let s: string = dicts[lang][key] ?? vi[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function t(key: MessageKey, vars?: Record<string, string | number>) {
  return translate(getSettings().lang, key, vars);
}

/** Hook variant so components re-render when language changes. */
export function useT() {
  const { lang } = useSettings();
  return (key: MessageKey, vars?: Record<string, string | number>) => translate(lang, key, vars);
}
