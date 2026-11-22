import { expect, test } from '@playwright/test';
import { newDevice, sampleFamily, seedFamily } from './helpers';

test('tree: full view, open a person, collapse a branch, search, branch view', async ({
  browser,
}) => {
  const people = sampleFamily();
  const fid = await seedFamily('Họ Nguyễn', people);
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await page.getByTestId('home-tree').click();

  // full view: everyone is drawn and the whole tree fits (zoomed out)
  await expect(page.locator('[data-testid^="card-"]')).toHaveCount(Object.keys(people).length);
  await expect
    .poll(async () => Number(await page.getByTestId('panzoom').getAttribute('data-scale')))
    .toBeLessThan(1);
  const svg = await page.getByTestId('tree-svg').boundingBox();
  const box = await page.getByTestId('panzoom').boundingBox();
  expect(svg!.width).toBeLessThanOrEqual(box!.width + 1);
  await page.screenshot({ path: 'test-results/screens/tree-full.png' });

  // collapse the first son's branch
  const before = await page.locator('[data-testid^="card-"]').count();
  await page.getByTestId('toggle-p000000001').dispatchEvent('click');
  await expect.poll(() => page.locator('[data-testid^="card-"]').count()).toBeLessThan(before);
  await page.getByTestId('expand-all').click();
  await expect(page.locator('[data-testid^="card-"]')).toHaveCount(before);

  // search jumps to a person and zooms in
  await page.getByTestId('tree-search-toggle').click();
  await page.getByTestId('tree-search').fill('to');
  await page.getByTestId('result-to00000001').click();
  await expect(page.getByTestId('card-to00000001')).toHaveClass(/focus/);
  await expect(page.getByTestId('panzoom')).toHaveAttribute('data-scale', '1.000');
  await page.screenshot({ path: 'test-results/screens/tree-focus.png' });

  // tapping a card opens the person
  await page.getByTestId('card-to00000001').click();
  await expect(page.getByTestId('person-name')).toHaveText('Nguyễn Văn Tổ');

  // branch view from a person
  await page.goto('/#/p/p000000001');
  await page.getByTestId('show-branch').click();
  await expect(page.getByRole('heading', { name: /^Nhánh/ })).toBeVisible();
  await expect(page.getByTestId('card-p000000001')).toBeVisible();
  const branchCount = await page.locator('[data-testid^="card-"]').count();
  expect(branchCount).toBeGreaterThan(1);
  expect(branchCount).toBeLessThan(before);
  await page.getByRole('button', { name: /Xem cả cây/ }).click();
  await expect(page.locator('[data-testid^="card-"]')).toHaveCount(before);
});

test('tree: dragging pans without opening a card', async ({ browser }) => {
  const fid = await seedFamily('Họ Nguyễn', sampleFamily());
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await expect(page.getByTestId('home-tree')).toBeVisible();
  await page.goto('/#/tree?focus=to00000001');
  await expect(page.getByTestId('card-to00000001')).toBeVisible();
  const card = page.getByTestId('card-to00000001');
  const b = (await card.boundingBox())!;
  await page.mouse.move(b.x + 20, b.y + 20);
  await page.mouse.down();
  await page.mouse.move(b.x + 120, b.y + 80, { steps: 5 });
  await page.mouse.up();
  await expect(page.getByTestId('tree-svg')).toBeVisible();
  const moved = (await card.boundingBox())!;
  expect(moved.x).toBeGreaterThan(b.x + 50);
});
