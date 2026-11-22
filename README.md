# Gia phả 🌳

Cây gia phả và lịch âm dương cho cả dòng họ. Chạy trên web, cài lên màn hình chính iPhone như app;
chữ to, ít bước cho ông bà.

**MVP 1 (trước Tết Đinh Mùi 06/02/2027):** cây gia phả (xem toàn bộ, xuất PDF để in), lịch âm dương cơ
bản (đổi ngày, đánh dấu giỗ & sinh nhật), mời người thân xem qua link.

> Đang ở tuần 2: đã có khung app, thư viện âm lịch, Firebase + đăng nhập Google.
> Các màn Cây / Lịch / Mời hiện là trang "Đang làm".

## Chạy trên máy

```bash
npm install
npm run dev            # http://localhost:5173/familytree/
```

Thử với Firebase giả lập, không đụng dữ liệu thật (cần Java 11+):

```bash
npm run emulators      # terminal 1
npm run dev:emu        # terminal 2
```

Mở trên iPhone cùng mạng Wi-Fi: dùng địa chỉ `Network:` mà Vite in ra.

## Kiểm thử

```bash
npm run lint && npm run typecheck
npm test               # unit: âm lịch (đối chiếu Tết 2020–2030, mọi ngày 1900–2100)…
npm run test:rules     # Firebase security rules (emulator)
npm run e2e            # Playwright, giả lập iPhone; chụp mọi màn vào test-results/screens/
npm run test:pwa       # app đã cài tự nhận bản mới
```

Trên iPhone không có devtools: bấm 5 lần vào tiêu đề trang chủ (hoặc Cài đặt → Nhật ký lỗi) để xem/chép log.

## Firebase (làm 1 lần — project `vb2-familytree`)

- Realtime Database (Singapore) → tab **Rules** → dán nội dung `database.rules.json` → **Publish**.
  Mỗi lần file rules đổi phải dán lại (hoặc `npx firebase deploy --only database`).
- Authentication → Sign-in method: bật **Google** và **Anonymous**.
- Authentication → Settings → **Authorized domains**: thêm `tunv87.github.io`.
- Config web nằm trong `.env.production` (công khai; dữ liệu được bảo vệ bởi rules).

Phân quyền: ai có link dòng họ (mã ngẫu nhiên 20 ký tự) thì xem được; chỉ quản trị đăng nhập
Google mới sửa được. Không ai liệt kê được danh sách các dòng họ.

## Deploy (làm 1 lần)

1. GitHub → repo → Settings → Pages → Source: **GitHub Actions**.
2. Push lên `main` → workflow _Deploy_ build và đăng tại `https://<user>.github.io/familytree/`.
3. Trên iPhone: mở link bằng Safari → Chia sẻ → **Thêm vào MH chính**.

Đổi icon: sửa `public/icon.svg` rồi chạy `npm run icons`.

## Cấu trúc

```
src/app/     trang chủ, cài đặt, nhật ký lỗi, store cài đặt
src/ui/      component dùng chung (TopBar, Card, Modal…)
src/lib/     âm lịch, logger, PWA tự cập nhật, localStorage
src/data/    Firebase: đăng nhập, dòng họ, kiểu dữ liệu
src/i18n/    tiếng Việt (mặc định) + tiếng Anh
e2e/         Playwright
tests-rules/ test security rules
```
