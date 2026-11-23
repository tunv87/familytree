// SEC-04: dependency audit + secret scan. Writes test-results/security.json in the
// same simple shape the report script reads: { tests: [{ title, status, message }] }.
import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';

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
const allow = JSON.parse(readFileSync('scripts/security-allowlist.json', 'utf8')).packages;
const vulns = Object.entries(audit.vulnerabilities ?? {});
const serious = vulns.filter(([, x]) => x.severity === 'high' || x.severity === 'critical');
const unexplained = serious.filter(([name]) => !allow[name]);
const counts = {};
for (const [, x] of vulns) counts[x.severity] = (counts[x.severity] ?? 0) + 1;
tests.push({
  title: 'SEC-04 npm audit: no high/critical vulnerabilities in runtime dependencies',
  status: audit.metadata ? (unexplained.length === 0 ? 'passed' : 'failed') : 'failed',
  message: audit.metadata
    ? `${JSON.stringify(counts)}; accepted (see security-allowlist.json): ${
        serious
          .filter(([n]) => allow[n])
          .map(([n]) => n)
          .join(', ') || 'none'
      }; unexplained: ${unexplained.map(([n, x]) => `${n} (${x.severity})`).join(', ') || 'none'}`
    : 'npm audit did not return a report (offline?)',
});

// 1b) the accepted packages must really be absent from what users download
execSync('npx vite build --outDir test-results/bundle --emptyOutDir', {
  stdio: 'ignore',
  env: { ...process.env, VITE_BASE: '/' },
});
const bundle = readdirSync('test-results/bundle/assets')
  .filter((f) => f.endsWith('.js'))
  .map((f) => readFileSync(`test-results/bundle/assets/${f}`, 'utf8'))
  .join('\n');
const found = Object.entries(allow).flatMap(([name, a]) =>
  a.bundleMarkers.filter((m) => bundle.includes(m)).map((m) => `${name}: "${m}"`),
);
tests.push({
  title: 'SEC-04 accepted vulnerable packages are not shipped in the app bundle',
  status: found.length ? 'failed' : 'passed',
  message: found.length
    ? `found in bundle: ${found.join('; ')}`
    : 'none of the markers found in the built JS',
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
