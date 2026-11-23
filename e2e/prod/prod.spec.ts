/** Runs against a production build (vite preview) pointed at the emulators. */
import { expect, test } from '@playwright/test';
import { sampleFamily, seedFamily, type SeedPerson } from '../helpers';

test('UX-01 first load of the built app is under 3 s and the 300-person tree under 1.5 s', async ({
  page,
}) => {
  const people: Record<string, SeedPerson> = {
    root00000001: { name: 'Phan Văn Tổ', gender: 'm', generation: 1 },
  };
  let n = 0;
  const grow = (id: string, gen: number) => {
    if (gen > 6 || n >= 300) return;
    for (let i = 0; i < (gen < 3 ? 4 : 3) && n < 300; i++) {
      const c = `c${String(++n).padStart(9, '0')}`;
      people[c] = { name: `Phan Văn Người ${n}`, gender: 'm', generation: gen + 1, fatherId: id };
      grow(c, gen + 1);
    }
  };
  grow('root00000001', 1);
  const fid = await seedFamily('Họ Phan', people);

  const t0 = Date.now();
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-tree')).toBeVisible();
  const load = Date.now() - t0;
  const nav = await page.evaluate(() => {
    const e = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: Math.round(e.domContentLoadedEventEnd),
      load: Math.round(e.loadEventEnd),
    };
  });
  const t1 = Date.now();
  await page.getByTestId('home-tree').click();
  await expect(page.locator('[data-testid^="card-"]')).toHaveCount(Object.keys(people).length);
  const tree = Date.now() - t1;
  test.info().annotations.push({
    type: 'timings (ms)',
    description: JSON.stringify({ firstScreen: load, ...nav, tree300: tree }),
  });
  expect.soft(load, `UX-01 first screen in ${load}ms`).toBeLessThan(3000);
  expect.soft(tree, `UX-01 300-person tree in ${tree}ms`).toBeLessThan(1500);
});

test('UX-M1(auto) installed app opens with no network at all (service worker + saved copy)', async ({
  page,
  context,
}) => {
  const fid = await seedFamily('Họ Ngoại Tuyến', sampleFamily());
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByRole('heading', { name: 'Họ Ngoại Tuyến' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
    timeout: 20_000,
  });
  await page.getByTestId('home-tree').click();
  await expect(page.getByTestId('tree-svg')).toBeVisible();
  await context.setOffline(true);
  await page.goto('/');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Họ Ngoại Tuyến' })).toBeVisible();
  await expect(page.getByText('Không có mạng')).toBeVisible();
  await page.getByTestId('home-calendar').click();
  await expect(page.getByTestId('cal-grid')).toBeVisible();
  await context.setOffline(false);
});
