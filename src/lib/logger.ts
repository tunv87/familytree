export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  t: number;
  level: LogLevel;
  scope: string;
  msg: string;
  data?: unknown;
}

const MAX = 500;
const buffer: LogEntry[] = [];
const listeners = new Set<() => void>();

function push(entry: LogEntry) {
  buffer.push(entry);
  if (buffer.length > MAX) buffer.shift();
  const line = `[${entry.scope}] ${entry.msg}`;
  if (import.meta.env.MODE !== 'test' || entry.level === 'error') {
    const fn = entry.level === 'debug' ? console.debug : console[entry.level];
    if (entry.data !== undefined) fn(line, entry.data);
    else fn(line);
  }
  listeners.forEach((l) => l());
}

export function createLogger(scope: string) {
  const at = (level: LogLevel) => (msg: string, data?: unknown) =>
    push({ t: Date.now(), level, scope, msg, data });
  return { debug: at('debug'), info: at('info'), warn: at('warn'), error: at('error') };
}

export function getLogs(): readonly LogEntry[] {
  return buffer;
}

export function clearLogs() {
  buffer.length = 0;
  listeners.forEach((l) => l());
}

export function subscribeLogs(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function formatLogs(): string {
  return buffer
    .map((e) => {
      const time = new Date(e.t).toISOString().slice(11, 23);
      const data = e.data === undefined ? '' : ' ' + safeStringify(e.data);
      return `${time} ${e.level.toUpperCase().padEnd(5)} [${e.scope}] ${e.msg}${data}`;
    })
    .join('\n');
}

function safeStringify(v: unknown): string {
  try {
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Capture uncaught errors so they show up on the /debug page (useful on iPhone without devtools). */
export function installGlobalErrorLogging() {
  const log = createLogger('global');
  window.addEventListener('error', (e) =>
    log.error(e.message, { src: e.filename, line: e.lineno }),
  );
  window.addEventListener('unhandledrejection', (e) => log.error('Unhandled rejection', e.reason));
}
