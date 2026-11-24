# Kết quả kiểm thử — run-27

- Thời điểm: 2026-11-24 12:00 UTC
- Commit: `c08f018`
- Môi trường: Chromium (Playwright) giả lập thiết bị, Firebase emulator, Node v22.23.5

## Các bước

| Bước | Kết quả | Thời gian |
|---|---|---|
| static | ✅ | 9s |
| unit | ✅ | 5s |
| rules | ✅ | 7s |
| e2e | ❌ | 639s |
| security | ✅ | 7s |
| pwa | ✅ | 14s |

## Tổng số test

| Bộ | Đạt | Lỗi | Bỏ qua |
|---|---|---|---|
| unit | 263 | 0 | 0 |
| rules | 24 | 0 | 0 |
| e2e | 74 | 4 | 8 |
| security | 3 | 0 | 0 |
| pwa | 1 | 0 | 0 |

**Test case lỗi: 5** · thiếu kết quả: không

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
| LG-04 | Quan hệ | 16 | 15 | 1 | ❌ FAIL |
| LG-05 | Xếp cây | 17 | 17 | 0 | ✅ PASS |
| LG-06 | Lịch tháng | 9 | 9 | 0 | ✅ PASS |
| LG-07 | In PDF | 6 | 6 | 0 | ✅ PASS |
| LG-08 | Tìm kiếm | 7 | 7 | 0 | ✅ PASS |
| LG-09 | Thứ tự anh chị em | 4 | 4 | 0 | ✅ PASS |
| LG-10 | Nhập & hiển thị ngày | 6 | 6 | 0 | ✅ PASS |
| LG-11 | Ngôn ngữ | 3 | 3 | 0 | ✅ PASS |
| LG-12 | Mời & nhớ gia phả | 4 | 4 | 0 | ✅ PASS |
| LG-13 | Xưng hô | 79 | 79 | 0 | ✅ PASS |
| LG-14 | Đời thứ tự tính | 19 | 19 | 0 | ✅ PASS |
| LG-15 | Ảnh đại diện | 8 | 7 | 1 | ❌ FAIL |
| LG-16 | Nơi ở | 4 | 4 | 0 | ✅ PASS |
| LG-17 | Ô trên cây | 16 | 16 | 0 | ✅ PASS |
| LG-18 | Nhắc giỗ vào lịch điện thoại | 9 | 9 | 0 | ✅ PASS |
| SEC-01 | Rules Firebase | 24 | 24 | 0 | ✅ PASS |
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
| UX-01 | Nhanh | 3 | 2 | 1 | ❌ FAIL |
| UX-02 | Không ngõ cụt | 1 | 1 | 0 | ✅ PASS |
| UX-03 | Bấm đúp không tạo trùng | 1 | 1 | 0 | ✅ PASS |
| UX-04 | Hỏi trước khi phá huỷ | 1 | 1 | 0 | ✅ PASS |
| UX-05 | Form dễ dùng | 1 | 1 | 0 | ✅ PASS |
| UX-06 | Cử chỉ trên cây | 3 | 3 | 0 | ✅ PASS |
| UX-07 | Link sâu sau khi tải lại | 1 | 1 | 0 | ✅ PASS |
| UX-08 | Chữ to | 1 | 1 | 0 | ✅ PASS |
| UX-09 | Trạng thái trống / không thấy / mất mạng | 3 | 3 | 0 | ✅ PASS |
| UX-10 | Nút chỉ có icon có tên; dùng bàn phím được | 1 | 1 | 0 | ✅ PASS |
| UX-11 | Cập nhật trực tiếp | 1 | 0 | 1 | ❌ FAIL |
| UX-12 | Tự cập nhật bản mới | 1 | 1 | 0 | ✅ PASS |
| UX-13 | Điều hướng | 25 | 25 | 0 | ✅ PASS |
| UX-14 | Hướng dẫn khi mở link lần đầu | 1 | 1 | 0 | ✅ PASS |
| UX-15 | Chữ dưới nút hình | 1 | 1 | 0 | ✅ PASS |
| UX-16 | "Sắp tới" trên trang chủ | 1 | 1 | 0 | ✅ PASS |
| UX-17 | Hoàn tác 10 giây | 3 | 3 | 0 | ✅ PASS |
| UX-M1 | Mở offline trên iPhone (phần tự động: Chromium) | 1 | 0 | 1 | ❌ FAIL |
| UX-M2 | Đăng nhập Google trên Safari iPhone | 0 | 0 | 0 | 🖐 tay / hoãn |
| UX-M3 | Mở link từ Zalo | 0 | 0 | 0 | 🖐 tay / hoãn |
| UX-M4 | Người lớn tuổi tự dùng | 0 | 0 | 0 | 🖐 tay / hoãn |

## Chi tiết lỗi

### LG-04 — Quan hệ

- **LG-04 UX-11 admin builds a small family; a relative opens the link and can only view** _(iphone)_

  ```
  Error: expect(locator).toHaveCount(expected) failed
  Received: 1
  ```

### LG-15 — Ảnh đại diện

- **LG-15 a new person can get a photo in the form; deleting them deletes the photo** _(iphone)_

  ```
  Error: expect(received).toBeNull()
  Received: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABgAGADASIAAhEBAxEB/8QAGQABAQEBAQEAAAAAAAAAAAAAAAcGCAEE/8QAKRAAAgAEAwcFAQAAAAAAAAAAAAECAwQFERdVBiExUXGT4hJBYYGUIv/EABcBAQEBAQAAAAAAAAAAAAAAAAADBQL/xAAYEQEBAQEBAAAAAAAAAAAAAAAAARICEf/aAAwDAQACEQMRAD8ArgAMNogAAAAAAAAAAAACfZsw6Q+/4jNmHSH3/EnYCuYombMOkPv+IzZh0h9/xJ2AZiiZsw6Q+/4jNmHSH3/EnYBmOhQFwASAAAAAHPQAC4AAAAA6FXAym2m2isEKpKNQzK2NYtvfDKXN/PJGqb9MDifssSDXaumXK5VNXNeMU2Y4uix3L6QS5npXXevucbjrKudObeOEUTwXRcEe0F4uFsmKOjq50lp44Qxbn1XBnxgKq3sZtnDtBC6SrUMuugWO7dDNXNfPNGqINZ66ZbLpS1cp4RSpii6r3X2i8J4pNcGEup457AAVAAAAAHQjXqgcL91gQW60My23KppJqwilTHD1WO5/aL2uBk9tNi1f0qyjcEutgWDT3Kavl8/kJc3xJgfVXWqutkxy6yknSGnh/cLSfR8GKG1V1zmKXR0k6e28P5h3Lq+CCr20UMy5XOlpJS/qbMUPRe7+kXlL0pJexldi9i1YIXV1jhmVsawwW9SlyT582asJdX1z0Ch5SrV3+fyGUq1d/n8g71E8BQ8pVq7/AD+QylWrv8/kDUTwFDylWrv8/kMpVq7/AD+QNRQlwAASGk+KxCSXBYAAAAAAAAAAAAAAAAAAAAB//9k="
  ```

### UX-01 — Nhanh

- **UX-01 first load of the built app is under 3 s and the 300-person tree under 1.5 s** _(prod)_

  ```
  Error: expect(locator).toBeVisible() failed
  ```

### UX-11 — Cập nhật trực tiếp

- **LG-04 UX-11 admin builds a small family; a relative opens the link and can only view** _(iphone)_

  ```
  Error: expect(locator).toHaveCount(expected) failed
  Received: 1
  ```

### UX-M1 — Mở offline trên iPhone (phần tự động: Chromium)

- **UX-M1(auto) installed app opens with no network at all (service worker + saved copy)** _(prod)_

  ```
  Test timeout of 90000ms exceeded.
  Error: locator.click: Test timeout of 90000ms exceeded.
  ```

## Số đo

- CR-03 a 1,000-person family: tree, list, calendar and PDF still work _(iphone)_: timings (ms): {"total":1000,"treeMs":964}
- UX-01 screens open within 500 ms and buttons react when pressed _(iphone)_: timings (ms): {"home-people":73,"home-tree":77,"home-calendar":74,"home-invite":73}
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
- SEC-04 no secrets committed (Firebase web config is public by design): 202 files scanned
