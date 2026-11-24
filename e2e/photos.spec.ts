import { expect, test } from '@playwright/test';
import { newDevice, readRaw, seedFamily, signInAdmin, type SeedPerson } from './helpers';

const FACE = 'e2e/fixtures/face.jpg';
const NOT_IMAGE = 'e2e/fixtures/not-an-image.txt';

const FAMILY: Record<string, SeedPerson> = {
  ong00001: { name: 'Võ Văn Tổ', gender: 'm', spouses: { ba000001: true } },
  ba000001: { name: 'Lê Thị Hiền', gender: 'f', spouses: { ong00001: true } },
  hung0001: {
    name: 'Võ Văn Hùng',
    gender: 'm',
    fatherId: 'ong00001',
    motherId: 'ba000001',
    place: 'Hoài Nhơn, Bình Định',
  },
  lan00001: { name: 'Võ Thị Lan', gender: 'f', fatherId: 'ong00001', motherId: 'ba000001' },
};

test('LG-15 admin adds a photo; it shows on the page, in lists and on the tree; viewers see it', async ({
  browser,
}) => {
  const admin = await newDevice(browser);
  const uid = await signInAdmin(admin, 'photo-admin');
  const fid = await seedFamily('Họ Võ', FAMILY, { admins: [uid] });
  await admin.goto(`/#/f/${fid}`);
  await expect(admin.getByTestId('home-people')).toBeVisible();

  // a person without a photo shows the default picture
  await admin.goto('/#/p/hung0001');
  await expect(admin.getByTestId('avatar-default')).toBeVisible();

  // "Đổi ảnh" on the page: pick a phone photo (portrait, with an EXIF rotation tag)
  await admin.getByTestId('profile-photo-file').setInputFiles(FACE);
  await expect(admin.getByTestId('photo-big')).toBeVisible();
  await expect(admin.getByTestId('toast')).toContainText('Đã lưu ảnh');

  // stored small and square, outside the family data
  const thumb = (await readRaw(`thumbs/${fid}/hung0001`)) as string;
  const photo = (await readRaw(`photos/${fid}/hung0001`)) as string;
  expect(thumb.startsWith('data:image/jpeg;base64,')).toBe(true);
  expect(thumb.length).toBeLessThan(16_000);
  expect(photo.length).toBeLessThan(100_000);
  expect(await readRaw(`families/${fid}/people/hung0001/photo`)).toBeNull();
  const size = await admin.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    return [img.naturalWidth, img.naturalHeight];
  }, photo);
  expect(size).toEqual([320, 320]);

  // lists and the tree (kiểu B: photo left of the name)
  await admin.goto('/#/people');
  await expect(admin.getByTestId('photo-hung0001')).toBeVisible();
  await expect(admin.getByTestId('person-hung0001')).toContainText('Hoài Nhơn, Bình Định');
  await admin.goto('/#/tree');
  await expect(admin.getByTestId('tree-photo-hung0001')).toBeAttached();
  await expect(admin.getByTestId('card-lan00001').locator('text.tree-default')).toBeAttached();

  // a relative who opened the link sees the photo too
  const viewer = await newDevice(browser);
  await viewer.goto(`/#/f/${fid}`);
  await expect(viewer.getByTestId('home-people')).toBeVisible();
  await viewer.goto('/#/p/hung0001');
  await expect(viewer.getByTestId('photo-big')).toBeVisible();
  await expect(viewer.getByTestId('change-photo')).toHaveCount(0);

  // the form: remove the photo → back to the default picture everywhere
  await admin.goto('/#/p/hung0001');
  await admin.getByTestId('edit-person').click();
  await expect(admin.getByTestId('form-photo')).toBeVisible();
  await admin.getByTestId('remove-photo').click();
  await admin.getByTestId('save').click();
  await expect(admin.getByTestId('person-name')).toBeVisible();
  await expect(admin.getByTestId('avatar-default')).toBeVisible();
  await expect.poll(() => readRaw(`thumbs/${fid}/hung0001`)).toBeNull();
  await expect(viewer.getByTestId('avatar-default')).toBeVisible();
});

test('LG-15 a new person can get a photo in the form; deleting them deletes the photo', async ({
  browser,
}) => {
  const admin = await newDevice(browser);
  const uid = await signInAdmin(admin, 'photo-admin-2');
  const fid = await seedFamily('Họ Võ', FAMILY, { admins: [uid] });
  await admin.goto(`/#/f/${fid}`);
  await expect(admin.getByTestId('home-people')).toBeVisible();
  await admin.goto('/#/p/hung0001');
  await admin.getByTestId('add-child').click();
  await admin.getByTestId('name').fill('Võ Minh Quân');
  await admin.getByTestId('place').fill('Đà Nẵng');
  await admin.getByTestId('photo-file').setInputFiles(FACE);
  await expect(admin.getByTestId('form-photo')).toBeVisible();
  await admin.getByTestId('save').click();
  await expect(admin.getByTestId('person-name')).toHaveText('Võ Minh Quân');
  await expect(admin.getByTestId('photo-big')).toBeVisible();
  await expect(admin.getByTestId('person-place')).toContainText('Đà Nẵng');
  const pid = admin.url().split('/p/')[1];
  expect(await readRaw(`thumbs/${fid}/${pid}`)).not.toBeNull();

  await admin.getByTestId('delete-person').click();
  await admin.getByTestId('confirm-delete').click();
  await expect(admin).not.toHaveURL(new RegExp(`/p/${pid}$`));
  // photos stay while "Hoàn tác" is offered (10 s), then go
  await expect.poll(() => readRaw(`thumbs/${fid}/${pid}`), { timeout: 16_000 }).toBeNull();
  await expect.poll(() => readRaw(`photos/${fid}/${pid}`), { timeout: 16_000 }).toBeNull();
});

test('CR-02 picking a file that is not a picture says so and nothing breaks', async ({
  browser,
}) => {
  const admin = await newDevice(browser);
  const uid = await signInAdmin(admin, 'photo-admin-3');
  const fid = await seedFamily('Họ Võ', FAMILY, { admins: [uid] });
  await admin.goto(`/#/f/${fid}`);
  await expect(admin.getByTestId('home-people')).toBeVisible();
  await admin.goto('/#/p/lan00001');
  await admin.getByTestId('edit-person').click();
  await admin.getByTestId('photo-file').setInputFiles(NOT_IMAGE);
  await expect(admin.getByTestId('photo-error')).toContainText('không phải ảnh');
  // a broken "picture" (right name, wrong content)
  await admin.getByTestId('photo-file').setInputFiles({
    name: 'anh.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('not really a jpeg'),
  });
  await expect(admin.getByTestId('photo-error')).toContainText('Không đọc được');
  await expect(admin.getByTestId('form-photo')).toHaveCount(0);
  // the form still saves normally
  await admin.getByTestId('save').click();
  await expect(admin.getByTestId('person-name')).toHaveText('Võ Thị Lan');
});

test('LG-16 nơi ở: typed in the form, shown on the page and in lists, found by search', async ({
  browser,
}) => {
  const admin = await newDevice(browser);
  const uid = await signInAdmin(admin, 'place-admin');
  const fid = await seedFamily('Họ Võ', FAMILY, { admins: [uid] });
  await admin.goto(`/#/f/${fid}`);
  await expect(admin.getByTestId('home-people')).toBeVisible();
  await admin.goto('/#/p/lan00001');
  await admin.getByTestId('edit-person').click();
  await admin.getByTestId('place').fill('TP. Hồ Chí Minh');
  await admin.getByTestId('save').click();
  await expect(admin.getByTestId('person-place')).toContainText('TP. Hồ Chí Minh');
  await admin.goto('/#/people');
  await admin.getByTestId('search').fill('ho chi minh');
  await expect(admin.locator('.person-row')).toHaveCount(1);
  await expect(admin.getByTestId('person-lan00001')).toContainText('TP. Hồ Chí Minh');
});
