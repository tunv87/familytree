// Turns the raw JSON of vitest / playwright / security scan into a per-test-case report.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const ID_RE = /\b(?:UI|UX|CR|LG|SEC)-(?:\d{2}|M\d)\b/g;

function readJson(f) {
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
}

/** Test cases from TEST_CASES.md: rows like "| UI-01 | title | … | Tự động/Tay | … |" */
function catalog() {
  const md = readFileSync('docs/testing/TEST_CASES.md', 'utf8');
  const cases = new Map();
  for (const line of md.split('\n')) {
    const m = line.match(/^\|\s*((?:UI|UX|CR|LG|SEC)-(?:\d{2}|M\d))\s*\|\s*([^|]+?)\s*\|/);
    if (m) cases.set(m[1], { id: m[1], title: m[2], manual: /\|\s*(Tay|Hoãn)\s*\|/.test(line) });
  }
  return cases;
}

/** flat list of { suite, title, project, status, errors[], ms } */
function collect(steps) {
  const tests = [];
  for (const [suite, file] of [
    ['unit', 'test-results/unit.json'],
    ['rules', 'test-results/rules.json'],
  ]) {
    const j = readJson(file);
    if (!j) continue;
    for (const f of j.testResults)
      for (const a of f.assertionResults)
        tests.push({
          suite,
          title: [...a.ancestorTitles, a.title].join(' › '),
          project: '',
          status: a.status === 'passed' ? 'passed' : a.status === 'failed' ? 'failed' : 'skipped',
          errors: a.failureMessages ?? [],
          ms: Math.round(a.duration ?? 0),
        });
  }
  const e2e = readJson('test-results/e2e.json');
  if (e2e) {
    const walk = (suite, parents) => {
      for (const spec of suite.specs ?? [])
        for (const t of spec.tests) {
          const r = t.results[t.results.length - 1] ?? { status: 'skipped', errors: [] };
          tests.push({
            suite: 'e2e',
            title: [...parents, spec.title].join(' › '),
            project: t.projectName,
            status:
              t.status === 'skipped' || r.status === 'skipped'
                ? 'skipped'
                : r.status === 'passed' && t.status !== 'unexpected'
                  ? 'passed'
                  : 'failed',
            errors: (r.errors ?? []).map((e) => e.message ?? String(e)),
            ms: r.duration ?? 0,
            notes: (t.annotations ?? []).map((a) => `${a.type}: ${a.description}`),
          });
        }
      for (const s of suite.suites ?? [])
        walk(
          s,
          [...parents, s.title].filter((x) => !/\.spec\.ts$/.test(x)),
        );
    };
    for (const s of e2e.suites) walk(s, []);
  }
  const sec = readJson('test-results/security.json');
  if (sec)
    for (const t of sec.tests)
      tests.push({
        suite: 'security',
        title: t.title,
        project: '',
        status: t.status,
        errors: t.status === 'failed' ? [t.message] : [],
        ms: 0,
        notes: [t.message],
      });
  const pwa = steps.find((s) => s.name === 'pwa');
  if (pwa)
    tests.push({
      suite: 'pwa',
      title: 'UX-12 an installed app picks up a new deployment on the next open',
      project: 'chromium',
      status: pwa.ok ? 'passed' : 'failed',
      errors: pwa.ok
        ? []
        : [
            existsSync('test-results/pwa.log')
              ? readFileSync('test-results/pwa.log', 'utf8')
              : 'failed',
          ],
      ms: pwa.seconds * 1000,
    });
  return tests;
}

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const strip = (s) => s.replace(ANSI, '');

export function buildReport({ steps, runName }) {
  const cases = catalog();
  const tests = collect(steps);
  const byId = new Map(
    [...cases.keys()].map((id) => [
      id,
      { tests: 0, passed: 0, failed: 0, skipped: 0, failures: [] },
    ]),
  );
  const unknownIds = new Set();
  for (const t of tests) {
    const ids = [...new Set(t.title.match(ID_RE) ?? [])];
    if (ids.length === 0) unknownIds.add(`(no id) ${t.title}`);
    const errText = strip(t.errors.join('\n'));
    const blamed = ids.filter((id) => errText.includes(id));
    for (const id of ids) {
      if (!byId.has(id)) {
        unknownIds.add(id);
        byId.set(id, { tests: 0, passed: 0, failed: 0, skipped: 0, failures: [] });
      }
      const r = byId.get(id);
      r.tests++;
      const failedHere = t.status === 'failed' && (blamed.length === 0 || blamed.includes(id));
      if (t.status === 'skipped') r.skipped++;
      else if (failedHere) {
        r.failed++;
        // keep only the lines that mention this id (soft assertions) or the first lines
        const lines = errText.split('\n').filter((l) => l.trim());
        const mine = lines.filter((l) => l.includes(id));
        r.failures.push({
          test: t.title,
          project: t.project,
          detail: (mine.length ? mine : lines).slice(0, 8).join('\n'),
        });
      } else r.passed++;
    }
  }

  const commit = (() => {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return '?';
    }
  })();
  const status = (r, c) =>
    c?.manual && r.tests === 0
      ? '🖐 tay / hoãn'
      : r.tests === 0
        ? '⚠️ chưa có kết quả'
        : r.failed
          ? '❌ FAIL'
          : r.passed
            ? '✅ PASS'
            : '⏭ bỏ qua';
  const rows = [...byId.entries()].sort(([a], [b]) => a.localeCompare(b));
  const failedIds = rows.filter(([, r]) => r.failed).length;
  const missing = rows
    .filter(([id, r]) => r.tests === 0 && !cases.get(id)?.manual)
    .map(([id]) => id);
  const suiteTotals = {};
  for (const t of tests) {
    const s = (suiteTotals[t.suite] ??= { passed: 0, failed: 0, skipped: 0 });
    s[t.status]++;
  }

  let md = `# Kết quả kiểm thử — ${runName}\n\n`;
  md += `- Thời điểm: ${new Date().toISOString().replace('T', ' ').slice(0, 16)} UTC\n`;
  md += `- Commit: \`${commit}\`\n`;
  md += `- Môi trường: Chromium (Playwright) giả lập thiết bị, Firebase emulator, Node ${process.version}\n\n`;
  md += `## Các bước\n\n| Bước | Kết quả | Thời gian |\n|---|---|---|\n`;
  for (const s of steps) md += `| ${s.name} | ${s.ok ? '✅' : '❌'} | ${s.seconds}s |\n`;
  md += `\n## Tổng số test\n\n| Bộ | Đạt | Lỗi | Bỏ qua |\n|---|---|---|---|\n`;
  for (const [k, s] of Object.entries(suiteTotals))
    md += `| ${k} | ${s.passed} | ${s.failed} | ${s.skipped} |\n`;
  md += `\n**Test case lỗi: ${failedIds}** · thiếu kết quả: ${missing.length ? missing.join(', ') : 'không'}\n`;
  md += `\n## Theo test case\n\n| ID | Nội dung | Số test | Đạt | Lỗi | Trạng thái |\n|---|---|---|---|---|---|\n`;
  for (const [id, r] of rows)
    md += `| ${id} | ${cases.get(id)?.title ?? '(không có trong danh mục)'} | ${r.tests} | ${r.passed} | ${r.failed} | ${status(r, cases.get(id))} |\n`;
  const failing = rows.filter(([, r]) => r.failed);
  if (failing.length) {
    md += `\n## Chi tiết lỗi\n`;
    for (const [id, r] of failing) {
      md += `\n### ${id} — ${cases.get(id)?.title ?? ''}\n`;
      for (const f of r.failures.slice(0, 12))
        md += `\n- **${f.test}**${f.project ? ` _(${f.project})_` : ''}\n\n  \`\`\`\n  ${f.detail.split('\n').join('\n  ')}\n  \`\`\`\n`;
      if (r.failures.length > 12)
        md += `\n- … và ${r.failures.length - 12} lỗi nữa (xem results.json)\n`;
    }
  }
  const notes = tests.filter((t) => t.notes?.length);
  if (notes.length) {
    md += `\n## Số đo\n\n`;
    for (const t of notes)
      md += `- ${t.title}${t.project ? ` _(${t.project})_` : ''}: ${t.notes.join('; ')}\n`;
  }
  if (unknownIds.size)
    md += `\n## Test chưa gắn vào danh mục\n\n${[...unknownIds].map((x) => `- ${x}`).join('\n')}\n`;

  return {
    summary: md,
    results: {
      run: runName,
      commit,
      steps,
      totals: { tests: tests.length, failedIds, missing },
      cases: Object.fromEntries(rows),
      tests: tests.map(({ errors, ...t }) => ({
        ...t,
        errors: errors.map((e) => strip(e).slice(0, 2000)),
      })),
    },
  };
}
