# Gia phả 🌳

Cây gia phả và lịch âm dương cho cả dòng họ. Chạy trên web, cài lên màn hình chính iPhone như app;
chữ to, ít bước cho ông bà.

**MVP 1 (trước Tết Đinh Mùi 06/02/2027):** cây gia phả (xem toàn bộ, xuất PDF để in), lịch âm dương cơ
bản (đổi ngày, đánh dấu giỗ & sinh nhật), mời người thân xem qua link.

> Đang ở tuần 1: khung app + deploy. Các màn Cây / Lịch / Mời hiện là trang "Đang làm".

## Chạy trên máy

```bash
npm install
npm run dev            # http://localhost:5173/familytree/
```

Mở trên iPhone cùng mạng Wi-Fi: dùng địa chỉ `Network:` mà Vite in ra.

## Kiểm thử

```bash
npm run lint && npm run typecheck
npm test               # unit
npm run e2e            # Playwright, giả lập iPhone; chụp mọi màn vào test-results/screens/
npm run test:pwa       # app đã cài tự nhận bản mới
```

Trên iPhone không có devtools: bấm 5 lần vào tiêu đề trang chủ (hoặc Cài đặt → Nhật ký lỗi) để xem/chép log.

## Deploy (làm 1 lần)

1. GitHub → repo → Settings → Pages → Source: **GitHub Actions**.
2. Push lên `main` → workflow _Deploy_ build và đăng tại `https://<user>.github.io/familytree/`.
3. Trên iPhone: mở link bằng Safari → Chia sẻ → **Thêm vào MH chính**.

Đổi icon: sửa `public/icon.svg` rồi chạy `npm run icons`.

## Cấu trúc

```
src/app/     trang chủ, cài đặt, nhật ký lỗi, store cài đặt
src/ui/      component dùng chung (TopBar, Card, Modal…)
src/lib/     logger, PWA tự cập nhật, localStorage
src/i18n/    tiếng Việt (mặc định) + tiếng Anh
e2e/         Playwright
```
