# Gia phả 🌳

Cây gia phả và lịch âm dương cho cả dòng họ. Chạy trên web, cài lên màn hình chính iPhone như app;
chữ to, ít bước cho ông bà. Xem được cả khi mất mạng.

**Link:** https://tunv87.github.io/familytree/

## Dùng thế nào

**Người nhập liệu (quản trị)** — cần tài khoản Google, nên làm trên Safari/Chrome hoặc máy tính:

1. Cài đặt ⚙️ → **Đăng nhập Google**.
2. Trang chủ → **Tạo gia phả mới** → đặt tên → nhập **thủy tổ** (người đầu tiên).
3. Ở trang mỗi người: **Thêm con / Thêm vợ chồng / Thêm cha / Thêm mẹ**, **Sửa**, **Sửa quan hệ**
   (khi nhập nhầm cha mẹ hoặc cần nối hai người có sẵn thành vợ chồng), **Xoá**.
4. Ngày sinh/mất nhập theo **âm hoặc dương lịch**, biết đến đâu nhập đến đó (chỉ năm cũng được).
   Ngày giỗ tự tính theo âm lịch của ngày mất.

**Người thân (xem)** — không cần tài khoản:

- Quản trị vào **Mời người thân** → cho quét **mã QR** hoặc **Gửi link** qua Zalo/Messenger.
- Mở link bằng Safari → nút Chia sẻ → **Thêm vào MH chính**.

**Các màn chính**

| Màn           | Có gì                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------- |
| Cây gia phả   | Toàn cây, kéo/chụm để zoom, thu gọn nhánh, tìm tên, xem theo nhánh, **in PDF A4/A3**         |
| Danh sách     | Theo đời, tìm tên không cần dấu                                                              |
| Lịch âm dương | Lịch tháng có ngày âm, Tết/rằm/mùng 1, giỗ & sinh nhật, sắp tới 30 ngày, đổi ngày âm ↔ dương |
| Mời           | Mã QR, gửi/chép link, đổi tên gia phả                                                        |

Gặp lỗi: Cài đặt → **Nhật ký lỗi** → Chép nhật ký → gửi cho người làm app
(hoặc bấm 5 lần vào tiêu đề trang chủ).

## Chạy trên máy

```bash
npm install
npm run dev            # http://localhost:5173/familytree/  (dùng Firebase thật)
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
npm test               # unit: âm lịch (Tết 2020–2030, mọi ngày 1900–2100), ngày giỗ, quan hệ, xếp cây, chia trang PDF
npm run test:rules     # Firebase security rules (emulator)
npm run e2e            # Playwright giả lập iPhone + emulator; ảnh mọi màn ở test-results/screens/
npm run test:pwa       # app đã cài tự nhận bản mới
```

## Firebase (project `vb2-familytree`)

- Realtime Database (Singapore) → tab **Rules** → dán nội dung `database.rules.json` → **Publish**.
  Mỗi lần file rules đổi phải dán lại (hoặc `npx firebase deploy --only database`).
- Authentication → Sign-in method: bật **Google** và **Anonymous**.
- Authentication → Settings → **Authorized domains**: thêm `tunv87.github.io`.
- Config web nằm trong `.env.production` (công khai; dữ liệu được bảo vệ bởi rules).

Phân quyền: ai có link dòng họ (mã ngẫu nhiên 20 ký tự) thì xem được; chỉ quản trị đăng nhập
Google mới sửa được. Không ai liệt kê được danh sách các dòng họ.

## Deploy

Push lên `main` → workflow _Deploy_ build và đăng lên GitHub Pages (Settings → Pages → Source:
GitHub Actions). App đã cài trên điện thoại tự cập nhật khi mở lại.

Đổi icon: sửa `public/icon.svg` rồi chạy `npm run icons`.

## Cấu trúc

```
src/app/       trang chủ, cài đặt, nhật ký lỗi, màn báo lỗi
src/family/    tạo/mở gia phả, danh sách, hồ sơ, thêm/sửa người, sửa quan hệ, mời
src/tree/      xếp cây (layout.ts), vẽ SVG, kéo/zoom, in PDF (pdfPlan, drawTree, exportPdf)
src/calendar/  lịch tháng, giỗ & sinh nhật
src/data/      Firebase, gia phả đang mở (+ bản lưu offline), ngày tháng, quan hệ
src/lib/       âm lịch (lunar.ts), logger, PWA, localStorage
src/i18n/      tiếng Việt (mặc định) + tiếng Anh
e2e/           Playwright
tests-rules/   test security rules
```
