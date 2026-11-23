// SEC-04: dependency audit + secret scan. Writes test-results/security.json in the
// same simple shape the report script reads: { tests: [{ title, status, message }] }.
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const tests = [];
mkdirSync('test-results', { recursive: true });

// 1) npm audit of what ships to users (runtime dependencies only)
let audit;
try {
  audit = JSON.parse(execSync('npm audit --omit=dev --json', { encoding: 'utf8' }));
} catch (e) {
  // npm audit exits non-zero when it finds anything; the JSON is still on stdout
  audit = JSON.parse(e.stdout || '{}');
}
writeFileSync('test-results/npm-audit.json', JSON.stringify(audit, null, 2));
const v = audit.metadata?.vulnerabilities ?? {};
const bad = (v.high ?? 0) + (v.critical ?? 0);
tests.push({
  title: 'SEC-04 npm audit: no high/critical vulnerabilities in runtime dependencies',
  status: audit.metadata ? (bad === 0 ? 'passed' : 'failed') : 'failed',
  message: audit.metadata
    ? `low ${v.low ?? 0}, moderate ${v.moderate ?? 0}, high ${v.high ?? 0}, critical ${v.critical ?? 0}`
    : 'npm audit did not return a report (offline?)',
});

// 2) secret scan of tracked files
const files = execSync('git ls-files', { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && !/\.(png|jpg|jpeg|woff2?|pdf|ico)$/.test(f) && f !== 'package-lock.json');
const patterns = [
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/"private_key"\s*:/, 'service-account key'],
  [/\bsk-[A-Za-z0-9]{20,}/, 'API secret key'],
  [/\bghp_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/\bxox[bap]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/AKIA[0-9A-Z]{16}/, 'AWS key'],
  [/FIREBASE_TOKEN\s*=\s*\S+/, 'Firebase CI token'],
];
const hits = [];
for (const f of files) {
  if (f === 'scripts/security-scan.mjs') continue;
  let text;
  try {
    text = readFileSync(f, 'utf8');
  } catch {
    continue;
  }
  for (const [re, what] of patterns) if (re.test(text)) hits.push(`${f}: ${what}`);
}
// the Firebase *web* API key is public by design; make sure it's the only key-like thing
tests.push({
  title: 'SEC-04 no secrets committed (Firebase web config is public by design)',
  status: hits.length ? 'failed' : 'passed',
  message: hits.length ? hits.join('; ') : `${files.length} files scanned`,
});

writeFileSync('test-results/security.json', JSON.stringify({ tests }, null, 2));
for (const t of tests)
  console.log(`${t.status === 'passed' ? '✓' : '✘'} ${t.title} — ${t.message}`);
