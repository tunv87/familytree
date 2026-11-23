# Kế hoạch kiểm thử — Gia phả

## Mục tiêu

Tìm và sửa lỗi trước khi cả họ dùng dịp Tết. Mỗi lần chạy lưu lại bằng chứng (kết quả từng test case,
ảnh chụp màn hình, số đo, báo cáo bảo mật) để xem lại về sau.

## Phạm vi

| Nhóm        | Mã     | Kiểm cái gì                                                                                                                  | Ở đâu                                                        |
| ----------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Giao diện   | UI-xx  | Mọi màn trên 9 cỡ màn hình phổ biến × chữ thường/chữ to: tràn, font, vùng chạm, cỡ chữ, tương phản, bị che, tên dài, màn lớn | `e2e/ui/`                                                    |
| Trải nghiệm | UX-xx  | Nhanh, không ngõ cụt, luôn có phản hồi, hỏi trước khi xoá, form dễ dùng, cử chỉ trên cây, link sâu, trợ năng                 | `e2e/ux/`, `e2e/prod/`, e2e cũ                               |
| Độ bền      | CR-xx  | Thao tác ngẫu nhiên, dữ liệu hỏng, gia phả 1.000 người, mất mạng, bộ nhớ hỏng, đường dẫn lạ, fuzz                            | `e2e/crash/`, `src/test/fuzz.test.ts`                        |
| Nghiệp vụ   | LG-xx  | Âm lịch, giỗ, sinh nhật, quan hệ, xếp cây, lịch, PDF, tìm kiếm                                                               | `src/**/*.test.ts`, e2e cũ                                   |
| Bảo mật     | SEC-xx | Rules Firebase, XSS, mã gia phả, lỗ hổng thư viện, lộ secret, phiên đăng nhập                                                | `tests-rules/`, `e2e/security/`, `scripts/security-scan.mjs` |

Danh mục đầy đủ: [TEST_CASES.md](TEST_CASES.md).

## Môi trường

- Chromium (Playwright 1.63) giả lập thiết bị: iPhone SE, iPhone 14, iPhone 14 Pro Max, Galaxy S8, Pixel 7,
  iPhone 14 xoay ngang, iPad Mini, laptop 1366×768, desktop 1920×1080.
  **Không có Safari/WebKit và điện thoại thật** → các điểm chỉ kiểm được trên iPhone thật nằm trong nhóm test tay (`Tay`).
- Firebase Auth + Realtime Database **emulator** (không đụng dữ liệu thật). Rules dùng đúng file `database.rules.json`.
- Bản dev (Vite) cho phần lớn test; bản **build production** (`vite build` + `vite preview`) cho thời gian tải và service worker.

## Tiêu chí đạt

- Mọi test case tự động **PASS**; không có lỗi JS chưa bắt (`pageerror`).
- **3 lần chạy liên tiếp đều xanh** (để loại test chập chờn) và CI trên GitHub xanh.
- Không còn lỗi mở trong [BUGS.md](BUGS.md), trừ mục ghi rõ "để v1.1" kèm lý do.

## Cách chạy

```bash
node scripts/run-tests.mjs              # chạy tất cả, ghi docs/testing/runs/run-NN/
node scripts/run-tests.mjs --evidence   # như trên + chép toàn bộ ảnh giao diện làm bằng chứng
node scripts/run-tests.mjs --only=unit,rules   # chỉ một vài bước
```

Kết quả mỗi lần chạy: `runs/run-NN/summary.md` (bảng theo test case, chi tiết lỗi, số đo),
`results.json` (dữ liệu thô), `npm-audit.json`, `screenshots/` (ảnh lỗi; ảnh mọi màn khi có `--evidence`).

## Quy trình

1. Viết test case → 2. Review từng case ([REVIEW_LOG.md](REVIEW_LOG.md)) → 3. Chạy → 4. Phân loại lỗi
   (lỗi sản phẩm / lỗi test / chập chờn) vào [BUGS.md](BUGS.md) → 5. Sửa, commit (ghi mã lỗi) → 6. Chạy lại đến khi đạt tiêu chí.
