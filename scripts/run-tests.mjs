// Runs the whole test suite and writes evidence to docs/testing/runs/run-NN/.
// Usage: node scripts/run-tests.mjs [--evidence] [--only=unit,rules,e2e,security,pwa]
//   --evidence  also copy every UI screenshot (otherwise only screenshots of failures)
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildReport } from './test-report.mjs';

const args = process.argv.slice(2);
const evidence = args.includes('--evidence');
const only = (
  args.find((a) => a.startsWith('--only=')) ?? '--only=static,unit,rules,e2e,security,pwa'
)
  .slice(7)
  .split(',');

// emulators listen on localhost: never send that through an HTTP proxy
const env = { ...process.env };
for (const k of ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy']) delete env[k];
const EMU = 'npx firebase emulators:exec --only auth,database --project demo-familytree';

rmSync('test-results', { recursive: true, force: true });
mkdirSync('test-results', { recursive: true });

const steps = [];
function run(name, cmd, extraEnv = {}) {
  if (!only.includes(name)) return;
  const t0 = Date.now();
  console.log(`\n=== ${name}: ${cmd}`);
  const r = spawnSync(cmd, { shell: true, stdio: 'inherit', env: { ...env, ...extraEnv } });
  steps.push({ name, ok: r.status === 0, seconds: Math.round((Date.now() - t0) / 1000) });
}

run('static', 'npm run lint && npx tsc -b');
run(
  'unit',
  'npx vitest run --reporter=default --reporter=json --outputFile.json=test-results/unit.json',
);
run(
  'rules',
  `${EMU} "npx vitest run --config vitest.rules.config.ts --reporter=default --reporter=json --outputFile.json=test-results/rules.json"`,
);
run('e2e', `${EMU} "npx playwright test"`, { PW_JSON: 'test-results/e2e.json' });
run('security', 'node scripts/security-scan.mjs');
run('pwa', 'node scripts/check-sw-update.mjs > test-results/pwa.log 2>&1');

// next run number
const runsDir = 'docs/testing/runs';
mkdirSync(runsDir, { recursive: true });
const n = Math.max(0, ...readdirSync(runsDir).map((d) => Number(d.replace('run-', '')) || 0)) + 1;
const out = join(runsDir, `run-${String(n).padStart(2, '0')}`);
mkdirSync(out, { recursive: true });

const { summary, results } = buildReport({ steps, runName: `run-${String(n).padStart(2, '0')}` });
writeFileSync(join(out, 'summary.md'), summary);
writeFileSync(join(out, 'results.json'), JSON.stringify(results, null, 2));
if (existsSync('test-results/npm-audit.json'))
  cpSync('test-results/npm-audit.json', join(out, 'npm-audit.json'));

// screenshots: failures always, the full UI set when asked
const shots = join(out, 'screenshots');
const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
      )
    : [];
for (const f of walk('test-results')) {
  const isFailure = /test-failed-\d+\.png$/.test(f);
  const isUi = f.startsWith(join('test-results', 'screens'));
  if (isFailure || (evidence && isUi)) {
    const rel = isFailure
      ? join('failures', f.split('/').slice(-2).join('__'))
      : f.replace(/^test-results\/screens\//, 'ui/');
    mkdirSync(join(shots, rel, '..'), { recursive: true });
    cpSync(f, join(shots, rel));
    if (isFailure) shrink(join(shots, rel));
  }
}
/** failure screenshots are big PNGs: shrink to a small JPEG if Python + Pillow exist */
function shrink(file) {
  const py = `from PIL import Image; import os, sys
f = sys.argv[1]; im = Image.open(f).convert('RGB'); im.thumbnail((800, 1600))
im.save(f[:-4] + '.jpg', 'JPEG', quality=60); os.remove(f)`;
  spawnSync('python3', ['-c', py, file], { stdio: 'ignore' });
}
console.log(`\nReport: ${join(out, 'summary.md')}`);
process.exit(results.totals.failedIds > 0 || steps.some((s) => !s.ok) ? 1 : 0);
