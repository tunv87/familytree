/**
 * UI matrix — runs once per screen-size project (ui-iphone-se, ui-pixel-7, ui-desktop-1920…).
 * Walks every screen of the app and checks layout rules on each; saves a screenshot of every
 * screen as evidence (UI-08). Accessibility (axe, incl. colour contrast) is a separate test.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { pageErrors, sampleFamily, seedFamily, signInAdmin, trackErrors } from '../helpers';

const LONG_FAMILY = 'Họ Nguyễn Văn — chi trưởng, làng Đông Ngạc, huyện Từ Liêm, Hà Nội (1900–2026)';
const LONG_PERSON =
  'Nguyễn Phúc Vĩnh Thụy Bảo Hoàng Nguyễn Thị Hồng Hạnh Phúc Lâm Kim Ngọc Bích Châu Quang Minh Thịnh Vượng An';
const NO_SPACE_NAME = 'Nguyễn_Văn_Tên_Rất_Dài_Không_Có_Khoảng_Trắng_Nào';

interface Screen {
  name: string;
  open: (page: Page) => Promise<void>;
}

/** Signs in, seeds a family the admin owns, and returns the list of screens to visit. */
async function prepare(page: Page): Promise<Screen[]> {
  const uid = await signInAdmin(page, `ui-${test.info().project.name}`);
  const people = sampleFamily();
  people.long000001 = {
    name: LONG_PERSON.slice(0, 100),
    gender: 'm',
    generation: 2,
    fatherId: 'to00000001',
    motherId: 'ba00000001',
    order: 9,
    note: 'Ghi chú dài: '.repeat(20),
  };
  people.nospace001 = { name: NO_SPACE_NAME, gender: 'f', generation: 2, fatherId: 'to00000001' };
  const fid = await seedFamily(LONG_FAMILY, people, { admins: [uid] });
  const go = (hash: string) => async (p: Page) => {
    await p.goto(`/#${hash}`);
  };
  return [
    { name: 'settings', open: go('/settings') },
    { name: 'debug', open: go('/debug') },
    { name: 'families', open: go('/families') },
    { name: 'new-family', open: go('/new-family') },
    {
      name: 'home',
      open: async (p) => {
        await p.goto(`/#/f/${fid}`);
        await expect(p.getByTestId('home-tree')).toBeVisible();
      },
    },
    {
      name: 'people',
      open: async (p) => {
        await p.goto('/#/people');
        await expect(p.locator('.person-row').first()).toBeVisible();
      },
    },
    {
      name: 'person',
      open: async (p) => {
        await p.goto('/#/p/to00000001');
        await expect(p.getByTestId('person-name')).toBeVisible();
      },
    },
    {
      name: 'person-long-name',
      open: async (p) => {
        await p.goto('/#/p/long000001');
        await expect(p.getByTestId('person-name')).toBeVisible();
      },
    },
    {
      name: 'person-no-space-name',
      open: async (p) => {
        await p.goto('/#/p/nospace001');
        await expect(p.getByTestId('person-name')).toBeVisible();
      },
    },
    {
      name: 'person-form',
      open: async (p) => {
        await p.goto('/#/add?parent=to00000001');
        await p.getByTestId('deceased').click();
      },
    },
    {
      name: 'relations',
      open: async (p) => {
        await p.goto('/#/relations/to00000001');
        await expect(p.getByTestId('rel-father')).toBeVisible();
      },
    },
    {
      name: 'tree',
      open: async (p) => {
        await p.goto('/#/tree');
        await expect(p.getByTestId('tree-svg')).toBeVisible();
      },
    },
    {
      name: 'tree-search',
      open: async (p) => {
        await p.getByTestId('tree-search-toggle').click();
        await p.getByTestId('tree-search').fill('nguyen');
      },
    },
    {
      name: 'pdf-dialog',
      open: async (p) => {
        await p.goto('/#/tree');
        await p.getByTestId('print').click();
        await expect(p.getByTestId('make-pdf')).toBeVisible();
      },
    },
    {
      name: 'calendar',
      open: async (p) => {
        await p.goto('/#/calendar');
        await expect(p.getByTestId('cal-grid')).toBeVisible();
      },
    },
    {
      name: 'invite',
      open: async (p) => {
        await p.goto('/#/invite');
        await expect(p.getByTestId('qr').locator('svg')).toBeVisible();
      },
    },
    {
      // xưng hô (LG-13): "this is me" on the founder, then a grandchild's page
      name: 'kinship-card',
      open: async (p) => {
        await p.goto('/#/p/to00000001');
        await p.getByTestId('set-me').click();
        await p.goto('/#/p/p000000002');
        await expect(p.getByTestId('kinship-call')).toBeVisible();
      },
    },
    {
      name: 'kinship',
      open: async (p) => {
        await p.getByTestId('how-to-call').click();
        await expect(p.getByTestId('kin-result')).toBeVisible();
      },
    },
    {
      name: 'delete-confirm',
      open: async (p) => {
        await p.goto('/#/p/to00000001');
        await p.getByTestId('delete-person').click();
        await expect(p.getByTestId('confirm-delete')).toBeVisible();
      },
    },
    { name: 'crash', open: go('/__crash') },
    {
      name: 'welcome',
      open: async (p) => {
        await p.evaluate(() => localStorage.removeItem('ft:family'));
        await p.goto('/');
        await p.reload();
        await expect(p.getByTestId('home-new-family')).toBeVisible();
      },
    },
  ];
}

interface Report {
  overflowX: number;
  offscreen: string[];
  badFont: string[];
  vietMissing: boolean;
  smallTargets: string[];
  tinyText: string[];
  smallLongText: string[];
  covered: string[];
  /** top bar without a title broke into two lines */
  barWrapped: boolean;
  wide: { screenW: number; contentW: number; treeW: number | null };
}

/** Layout checks done inside the page (UI-01..04, 06, 09). */
async function inspect(page: Page): Promise<Report> {
  // The real screen width. On phones the browser widens the layout viewport (innerWidth) to fit
  // content that is too wide, so innerWidth alone would hide a page that scrolls sideways.
  const screenW = page.viewportSize()!.width;
  return page.evaluate(async (screenW) => {
    await document.fonts.ready;
    const W = screenW;
    const H = window.innerHeight;
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const describe = (el: Element) => {
      const label =
        el.getAttribute('aria-label') ||
        el.getAttribute('data-testid') ||
        (el.textContent ?? '').trim().slice(0, 24) ||
        el.tagName;
      return `${el.tagName.toLowerCase()}[${label}]`;
    };
    // when a dialog is open only its contents can be used
    const modal = document.querySelector('.modal');
    const scope: ParentNode = modal ?? document;
    const interactive = [
      ...scope.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea'),
    ].filter((el) => visible(el) && !el.closest('.panzoom-content'));

    const offscreen = interactive
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.left < -1 || r.right > W + 1;
      })
      .map(describe);

    const smallTargets = interactive
      .map((el) => {
        const target =
          el instanceof HTMLInputElement && el.type === 'checkbox'
            ? (el.closest('label') ?? el)
            : el;
        const r = target.getBoundingClientRect();
        return { el, w: Math.round(r.width), h: Math.round(r.height) };
      })
      .filter(({ w, h }) => w < 44 || h < 44)
      .map(({ el, w, h }) => `${describe(el)} ${w}×${h}`);

    const badFont: string[] = [];
    const tinyText: string[] = [];
    const smallLongText: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent ?? '').trim();
      if (!/\p{L}|\p{N}/u.test(text)) continue;
      const el = n.parentElement!;
      if (!visible(el)) continue;
      if (el.closest('.log-view')) continue; // intentionally monospace debug output
      const cs = getComputedStyle(el);
      const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      if (family !== 'Nunito') badFont.push(`"${text.slice(0, 20)}" → ${family}`);
      if (el.closest('svg')) continue; // tree text is sized by zoom
      const size = parseFloat(cs.fontSize);
      if (size < 12) tinyText.push(`"${text.slice(0, 20)}" ${size}px`);
      if (text.length >= 25 && size < 16) smallLongText.push(`"${text.slice(0, 20)}…" ${size}px`);
    }
    const faces = [...document.fonts].filter((f) => f.family.replace(/["']/g, '') === 'Nunito');
    const vietLoaded = faces.some(
      (f) => f.status === 'loaded' && f.unicodeRange.includes('U+1EA0'),
    );
    const hasViet = /[ạ-ỹđăâêôơư]/i.test(document.body.innerText);

    // is anything drawn on top of a control? (check controls whose centre is on screen)
    const covered = interactive
      .filter((el) => {
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        if (x < 0 || y < 0 || x > W || y > H) return false;
        const top = document.elementFromPoint(x, y);
        if (!top) return false;
        const label = el.closest('label');
        if (el.contains(top) || top.contains(el) || (label && label.contains(top))) return false;
        // content scrolling under a sticky/fixed bar (e.g. the search box) is expected
        for (let a: Element | null = top; a; a = a.parentElement) {
          const pos = getComputedStyle(a).position;
          if ((pos === 'sticky' || pos === 'fixed') && !a.classList.contains('modal-backdrop'))
            return false;
          // a transient popup (search results) is meant to sit on top while open
          if (a.hasAttribute('data-popup')) return false;
        }
        return true;
      })
      .map(describe);

    const bar = document.querySelector('.topbar');
    const barBtn = bar?.querySelector('button');
    const barWrapped = Boolean(
      bar &&
      barBtn &&
      !(bar.querySelector('h1')?.textContent ?? '').trim() &&
      bar.getBoundingClientRect().height > barBtn.getBoundingClientRect().height * 1.5,
    );
    const screenEl = document.querySelector('.screen');
    const tree = document.querySelector('.tree-wrap');
    return {
      overflowX: Math.max(document.documentElement.scrollWidth, window.innerWidth) - W,
      offscreen,
      badFont,
      vietMissing: hasViet && !vietLoaded,
      smallTargets,
      tinyText,
      smallLongText,
      covered,
      barWrapped,
      wide: {
        screenW: W,
        contentW:
          screenEl && !screenEl.classList.contains('tree-screen')
            ? Math.round(screenEl.getBoundingClientRect().width)
            : 0,
        treeW: tree ? Math.round(tree.getBoundingClientRect().width) : null,
      },
    };
  }, screenW);
}

function assertReport(screen: string, r: Report) {
  const s = expect.soft;
  s(r.overflowX, `UI-01 ${screen}: page scrolls sideways by ${r.overflowX}px`).toBeLessThanOrEqual(
    0,
  );
  s(r.offscreen, `UI-01 ${screen}: controls cut off at the screen edge`).toEqual([]);
  s(r.barWrapped, `UI-01 ${screen}: top bar without a title wraps to two lines`).toBe(false);
  s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
  s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
  s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  if (r.wide.screenW >= 768) {
    if (r.wide.contentW)
      s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
        760,
      );
    if (r.wide.treeW !== null)
      s(r.wide.treeW, `UI-09 ${screen}: tree does not use the screen`).toBeGreaterThanOrEqual(
        r.wide.screenW * 0.9,
      );
  }
}

for (const variant of ['normal', 'big'] as const) {
  test(`UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (${variant} text)`, async ({
    page,
  }) => {
    test.setTimeout(300_000);
    trackErrors(page);
    if (variant === 'big')
      await page
        .context()
        .addInitScript(() =>
          localStorage.setItem('ft:settings', JSON.stringify({ bigText: true })),
        );
    const screens = await prepare(page);
    const dir = `test-results/screens/${test.info().project.name.replace(/^ui-/, '')}`;
    for (const sc of screens) {
      await test.step(sc.name, async () => {
        await sc.open(page);
        await page.waitForTimeout(300); // let pop/fade animations settle
        assertReport(sc.name, await inspect(page));
        // also check the bottom of long screens
        const scrolled = await page.evaluate(() => {
          const before = window.scrollY;
          window.scrollTo(0, document.documentElement.scrollHeight);
          return window.scrollY !== before;
        });
        if (scrolled) {
          await page.waitForTimeout(100);
          assertReport(`${sc.name} (bottom)`, await inspect(page));
          await page.evaluate(() => window.scrollTo(0, 0));
        }
        await page.screenshot({
          path: `${dir}/${variant}-${sc.name}.jpg`,
          type: 'jpeg',
          quality: 60,
        });
      });
    }
    // the crash screen is visited on purpose; any other uncaught error is a bug
    const errors = pageErrors(page).filter((e) => !e.includes('intentional test crash'));
    expect.soft(errors, 'UI-08 uncaught errors while walking the screens').toEqual([]);
  });
}

test('UI-05 accessibility & colour contrast (axe, WCAG 2 AA)', async ({ page }) => {
  test.setTimeout(300_000);
  // the rules don't depend much on screen size: scan one phone and one desktop
  test.skip(
    !['ui-iphone-14', 'ui-desktop-1920'].includes(test.info().project.name),
    'scanned on iphone-14 and desktop-1920 only',
  );
  const screens = await prepare(page);
  for (const sc of screens) {
    await test.step(sc.name, async () => {
      await sc.open(page);
      await page.waitForTimeout(300);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = result.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map(
          (v) =>
            `${v.id}: ${v.help} — ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(' '))
              .join(' | ')}`,
        );
      expect.soft(serious, `UI-05 ${sc.name}: serious accessibility problems`).toEqual([]);
    });
  }
});
