# Kết quả kiểm thử — run-41

- Thời điểm: 2026-11-27 06:08 UTC
- Commit: `8215465`
- Môi trường: Chromium (Playwright) giả lập thiết bị, Firebase emulator, Node v22.23.5

## Các bước

| Bước | Kết quả | Thời gian |
|---|---|---|
| static | ✅ | 9s |
| unit | ✅ | 6s |
| rules | ✅ | 7s |
| e2e | ✅ | 564s |
| security | ✅ | 4s |
| pwa | ✅ | 15s |

## Tổng số test

| Bộ | Đạt | Lỗi | Bỏ qua |
|---|---|---|---|
| unit | 290 | 0 | 0 |
| rules | 25 | 0 | 0 |
| e2e | 80 | 0 | 8 |
| security | 3 | 0 | 0 |
| pwa | 1 | 0 | 0 |

**Test case lỗi: 0** · thiếu kết quả: không

## Theo test case

| ID | Nội dung | Số test | Đạt | Lỗi | Trạng thái |
|---|---|---|---|---|---|
| CR-01 | Monkey test | 1 | 1 | 0 | ✅ PASS |
| CR-02 | Dữ liệu hỏng trong DB | 10 | 10 | 0 | ✅ PASS |
| CR-03 | Gia phả 1.000 người | 1 | 1 | 0 | ✅ PASS |
| CR-04 | Mất mạng khi đang lưu | 1 | 1 | 0 | ✅ PASS |
| CR-05 | Bộ nhớ máy hỏng / bị chặn | 1 | 1 | 0 | ✅ PASS |
| CR-06 | Đường dẫn lạ | 2 | 2 | 0 | ✅ PASS |
| CR-07 | Fuzz hàm thuần | 9 | 9 | 0 | ✅ PASS |
| CR-08 | Màn báo lỗi | 2 | 2 | 0 | ✅ PASS |
| LG-01 | Âm lịch | 34 | 34 | 0 | ✅ PASS |
| LG-02 | Ngày giỗ | 14 | 14 | 0 | ✅ PASS |
| LG-03 | Sinh nhật | 2 | 2 | 0 | ✅ PASS |
| LG-04 | Quan hệ | 16 | 16 | 0 | ✅ PASS |
| LG-05 | Xếp cây | 17 | 17 | 0 | ✅ PASS |
| LG-06 | Lịch tháng | 9 | 9 | 0 | ✅ PASS |
| LG-07 | In PDF | 6 | 6 | 0 | ✅ PASS |
| LG-08 | Tìm kiếm | 7 | 7 | 0 | ✅ PASS |
| LG-09 | Thứ tự anh chị em | 4 | 4 | 0 | ✅ PASS |
| LG-10 | Nhập & hiển thị ngày | 6 | 6 | 0 | ✅ PASS |
| LG-11 | Ngôn ngữ | 3 | 3 | 0 | ✅ PASS |
| LG-12 | Mời & nhớ gia phả | 4 | 4 | 0 | ✅ PASS |
| LG-13 | Xưng hô | 86 | 86 | 0 | ✅ PASS |
| LG-14 | Đời thứ tự tính | 19 | 19 | 0 | ✅ PASS |
| LG-15 | Ảnh đại diện | 8 | 8 | 0 | ✅ PASS |
| LG-16 | Nơi ở | 4 | 4 | 0 | ✅ PASS |
| LG-17 | Ô trên cây | 21 | 21 | 0 | ✅ PASS |
| LG-18 | Nhắc giỗ vào lịch điện thoại | 9 | 9 | 0 | ✅ PASS |
| LG-19 | Thêm anh/chị/em | 17 | 17 | 0 | ✅ PASS |
| SEC-01 | Rules Firebase | 25 | 25 | 0 | ✅ PASS |
| SEC-02 | XSS | 2 | 2 | 0 | ✅ PASS |
| SEC-03 | Mã gia phả | 3 | 3 | 0 | ✅ PASS |
| SEC-04 | Thư viện & secret | 3 | 3 | 0 | ✅ PASS |
| SEC-05 | Phiên đăng nhập | 2 | 2 | 0 | ✅ PASS |
| SEC-06 | Rules trên production | 0 | 0 | 0 | 🖐 tay / hoãn |
| SEC-07 | Content-Security-Policy | 0 | 0 | 0 | 🖐 tay / hoãn |
| UI-01 | Không tràn ngang, không cắt mép | 20 | 20 | 0 | ✅ PASS |
| UI-02 | Font Nunito + đủ dấu tiếng Việt | 20 | 20 | 0 | ✅ PASS |
| UI-03 | Vùng chạm ≥ 44×44 px | 20 | 20 | 0 | ✅ PASS |
| UI-04 | Cỡ chữ đủ đọc | 20 | 20 | 0 | ✅ PASS |
| UI-05 | Trợ năng + tương phản (WCAG 2 AA) | 10 | 2 | 0 | ✅ PASS |
| UI-06 | Không nút nào bị che | 20 | 20 | 0 | ✅ PASS |
| UI-07 | Tên rất dài không phá bố cục | 20 | 20 | 0 | ✅ PASS |
| UI-08 | Ảnh bằng chứng mọi màn, không lỗi JS | 20 | 20 | 0 | ✅ PASS |
| UI-09 | Màn lớn dùng chỗ hợp lý | 20 | 20 | 0 | ✅ PASS |
| UI-10 | Nút chính luôn thấy | 20 | 20 | 0 | ✅ PASS |
| UX-01 | Nhanh | 3 | 3 | 0 | ✅ PASS |
| UX-02 | Không ngõ cụt | 1 | 1 | 0 | ✅ PASS |
| UX-03 | Bấm đúp không tạo trùng | 1 | 1 | 0 | ✅ PASS |
| UX-04 | Hỏi trước khi phá huỷ | 1 | 1 | 0 | ✅ PASS |
| UX-05 | Form dễ dùng | 1 | 1 | 0 | ✅ PASS |
| UX-06 | Cử chỉ trên cây | 3 | 3 | 0 | ✅ PASS |
| UX-07 | Link sâu sau khi tải lại | 1 | 1 | 0 | ✅ PASS |
| UX-08 | Chữ to | 1 | 1 | 0 | ✅ PASS |
| UX-09 | Trạng thái trống / không thấy / mất mạng | 3 | 3 | 0 | ✅ PASS |
| UX-10 | Nút chỉ có icon có tên; dùng bàn phím được | 1 | 1 | 0 | ✅ PASS |
| UX-11 | Cập nhật trực tiếp | 1 | 1 | 0 | ✅ PASS |
| UX-12 | Tự cập nhật bản mới | 1 | 1 | 0 | ✅ PASS |
| UX-13 | Điều hướng | 26 | 26 | 0 | ✅ PASS |
| UX-14 | Hướng dẫn khi mở link lần đầu | 1 | 1 | 0 | ✅ PASS |
| UX-15 | Chữ dưới nút hình | 1 | 1 | 0 | ✅ PASS |
| UX-16 | "Sắp tới" trên trang chủ | 1 | 1 | 0 | ✅ PASS |
| UX-17 | Hoàn tác 10 giây | 3 | 3 | 0 | ✅ PASS |
| UX-M1 | Mở offline trên iPhone (phần tự động: Chromium) | 1 | 1 | 0 | ✅ PASS |
| UX-M2 | Đăng nhập Google trên Safari iPhone | 0 | 0 | 0 | 🖐 tay / hoãn |
| UX-M3 | Mở link từ Zalo | 0 | 0 | 0 | 🖐 tay / hoãn |
| UX-M4 | Người lớn tuổi tự dùng | 0 | 0 | 0 | 🖐 tay / hoãn |

## Số đo

- CR-03 a 1,000-person family: tree, list, calendar and PDF still work _(iphone)_: timings (ms): {"total":1000,"treeMs":1016}
- UX-01 screens open within 500 ms and buttons react when pressed _(iphone)_: timings (ms): {"home-people":72,"home-tree":75,"home-calendar":69,"home-invite":71}
- UX-01 first load of the built app is under 3 s and the 300-person tree under 1.5 s _(prod)_: timings (ms): {"firstScreen":263,"domContentLoaded":64,"load":64,"tree300":211}
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-small-320)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-iphone-se-3)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-iphone-14-pro-max)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-galaxy-s8)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-pixel-7)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-iphone-14-landscape)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-ipad-mini)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-laptop-1366)_: skip: scanned on iphone-14 and desktop-1920 only
- SEC-04 npm audit: no high/critical vulnerabilities in runtime dependencies: {"high":4,"moderate":2}; accepted (see security-allowlist.json): @firebase/firestore, @firebase/firestore-compat, @grpc/grpc-js, firebase; unexplained: none
- SEC-04 accepted vulnerable packages are not shipped in the app bundle: none of the markers found in the built JS
- SEC-04 no secrets committed (Firebase web config is public by design): 244 files scanned
