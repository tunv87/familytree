import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { newDevice, sampleFamily, seedFamily } from './helpers';

test('print the tree to a PDF (one sheet and tiled sheets)', async ({ browser }) => {
  const fid = await seedFamily('Họ Nguyễn — Đông Ngạc', sampleFamily());
  const page = await newDevice(browser);
  await page.goto(`/#/f/${fid}`);
  await page.getByTestId('home-tree').click();
  await page.getByTestId('print').click();
  await page.screenshot({ path: 'test-results/screens/pdf-dialog.png' });

  const make = async (paper: 'a4' | 'a3', mode: 'auto' | 'one' | 'tiles') => {
    await page.getByTestId(`paper-${paper}`).click();
    await page.getByTestId(`mode-${mode}`).click();
    const estimate = (await page.getByTestId('pdf-estimate').textContent())!;
    const sheets = estimate.startsWith('Vừa 1 tờ') ? 1 : Number(estimate.match(/^(\d+) tờ/)![1]);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 60_000 }),
      page.getByTestId('make-pdf').click(),
    ]);
    expect(download.suggestedFilename()).toBe('gia-pha-ho-nguyen-dong-ngac.pdf');
    const path = `test-results/tree-${paper}-${mode}.pdf`;
    await download.saveAs(path);
    const pdf = readFileSync(path).toString('latin1');
    expect(pdf.startsWith('%PDF')).toBe(true);
    const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pages).toBe(sheets);
    return pages;
  };

  expect(await make('a4', 'one')).toBe(1);
  await page.getByTestId('print').click();
  const tiled = await make('a4', 'tiles');
  expect(tiled).toBeGreaterThan(1);
  await page.getByTestId('print').click();
  expect(await make('a3', 'tiles')).toBeLessThanOrEqual(tiled);
});
