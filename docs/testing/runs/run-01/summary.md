# Kết quả kiểm thử — run-01

- Thời điểm: 2026-11-23 02:33 UTC
- Commit: `59ffbd4`
- Môi trường: Chromium (Playwright) giả lập thiết bị, Firebase emulator, Node v22.23.5

## Các bước

| Bước     | Kết quả | Thời gian |
| -------- | ------- | --------- |
| static   | ✅      | 6s        |
| unit     | ❌      | 4s        |
| rules    | ❌      | 10s       |
| e2e      | ❌      | 1596s     |
| security | ✅      | 2s        |
| pwa      | ✅      | 13s       |

## Tổng số test

| Bộ       | Đạt | Lỗi | Bỏ qua |
| -------- | --- | --- | ------ |
| e2e      | 32  | 28  | 7      |
| security | 1   | 1   | 0      |
| pwa      | 1   | 0   | 0      |

**Test case lỗi: 15** · thiếu kết quả: CR-07, LG-01, LG-03, LG-08, LG-09, LG-10, SEC-01

## Theo test case

| ID     | Nội dung                                        | Số test | Đạt | Lỗi | Trạng thái         |
| ------ | ----------------------------------------------- | ------- | --- | --- | ------------------ |
| CR-01  | Monkey test                                     | 1       | 0   | 1   | ❌ FAIL            |
| CR-02  | Dữ liệu hỏng trong DB                           | 1       | 0   | 1   | ❌ FAIL            |
| CR-03  | Gia phả 1.000 người                             | 1       | 1   | 0   | ✅ PASS            |
| CR-04  | Mất mạng khi đang lưu                           | 1       | 0   | 1   | ❌ FAIL            |
| CR-05  | Bộ nhớ máy hỏng / bị chặn                       | 1       | 0   | 1   | ❌ FAIL            |
| CR-06  | Đường dẫn lạ                                    | 2       | 2   | 0   | ✅ PASS            |
| CR-07  | Fuzz hàm thuần                                  | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| CR-08  | Màn báo lỗi                                     | 2       | 2   | 0   | ✅ PASS            |
| LG-01  | Âm lịch                                         | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-02  | Ngày giỗ                                        | 1       | 1   | 0   | ✅ PASS            |
| LG-03  | Sinh nhật                                       | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-04  | Quan hệ                                         | 2       | 2   | 0   | ✅ PASS            |
| LG-05  | Xếp cây                                         | 1       | 1   | 0   | ✅ PASS            |
| LG-06  | Lịch tháng                                      | 2       | 2   | 0   | ✅ PASS            |
| LG-07  | In PDF                                          | 1       | 1   | 0   | ✅ PASS            |
| LG-08  | Tìm kiếm & gợi ý đời                            | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-09  | Thứ tự anh chị em                               | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-10  | Nhập & hiển thị ngày                            | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-11  | Ngôn ngữ                                        | 1       | 1   | 0   | ✅ PASS            |
| LG-12  | Mời & nhớ gia phả                               | 3       | 3   | 0   | ✅ PASS            |
| SEC-01 | Rules Firebase                                  | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| SEC-02 | XSS                                             | 2       | 2   | 0   | ✅ PASS            |
| SEC-03 | Mã gia phả                                      | 1       | 0   | 1   | ❌ FAIL            |
| SEC-04 | Thư viện & secret                               | 2       | 1   | 1   | ❌ FAIL            |
| SEC-05 | Phiên đăng nhập                                 | 2       | 2   | 0   | ✅ PASS            |
| SEC-06 | Rules trên production                           | 0       | 0   | 0   | 🖐 tay / hoãn      |
| SEC-07 | Content-Security-Policy                         | 0       | 0   | 0   | 🖐 tay / hoãn      |
| UI-01  | Không tràn ngang, không cắt mép                 | 18      | 18  | 0   | ✅ PASS            |
| UI-02  | Font Nunito + đủ dấu tiếng Việt                 | 18      | 0   | 18  | ❌ FAIL            |
| UI-03  | Vùng chạm ≥ 44×44 px                            | 18      | 0   | 18  | ❌ FAIL            |
| UI-04  | Cỡ chữ đủ đọc                                   | 18      | 0   | 18  | ❌ FAIL            |
| UI-05  | Trợ năng + tương phản (WCAG 2 AA)               | 9       | 0   | 2   | ❌ FAIL            |
| UI-06  | Không nút nào bị che                            | 18      | 0   | 18  | ❌ FAIL            |
| UI-07  | Tên rất dài không phá bố cục                    | 18      | 18  | 0   | ✅ PASS            |
| UI-08  | Ảnh bằng chứng mọi màn, không lỗi JS            | 18      | 18  | 0   | ✅ PASS            |
| UI-09  | Màn lớn dùng chỗ hợp lý                         | 18      | 10  | 8   | ❌ FAIL            |
| UX-01  | Nhanh                                           | 3       | 3   | 0   | ✅ PASS            |
| UX-02  | Không ngõ cụt                                   | 1       | 1   | 0   | ✅ PASS            |
| UX-03  | Bấm đúp không tạo trùng                         | 1       | 1   | 0   | ✅ PASS            |
| UX-04  | Hỏi trước khi phá huỷ                           | 1       | 0   | 1   | ❌ FAIL            |
| UX-05  | Form dễ dùng                                    | 1       | 0   | 1   | ❌ FAIL            |
| UX-06  | Cử chỉ trên cây                                 | 3       | 2   | 1   | ❌ FAIL            |
| UX-07  | Link sâu sau khi tải lại                        | 1       | 1   | 0   | ✅ PASS            |
| UX-08  | Chữ to                                          | 1       | 1   | 0   | ✅ PASS            |
| UX-09  | Trạng thái trống / không thấy / mất mạng        | 3       | 3   | 0   | ✅ PASS            |
| UX-10  | Nút chỉ có icon có tên; dùng bàn phím được      | 1       | 1   | 0   | ✅ PASS            |
| UX-11  | Cập nhật trực tiếp                              | 1       | 1   | 0   | ✅ PASS            |
| UX-12  | Tự cập nhật bản mới                             | 1       | 1   | 0   | ✅ PASS            |
| UX-M1  | Mở offline trên iPhone (phần tự động: Chromium) | 1       | 1   | 0   | ✅ PASS            |
| UX-M2  | Đăng nhập Google trên Safari iPhone             | 0       | 0   | 0   | 🖐 tay / hoãn      |
| UX-M3  | Mở link từ Zalo                                 | 0       | 0   | 0   | 🖐 tay / hoãn      |
| UX-M4  | Người lớn tuổi tự dùng                          | 0       | 0   | 0   | 🖐 tay / hoãn      |

## Chi tiết lỗi

### CR-01 — Monkey test

- **CR-01 monkey test: 300 random actions as a viewer and as an admin** _(iphone)_

  ```
  Test timeout of 240000ms exceeded.
  Error: locator.count: Target page, context or browser has been closed
    89 |       // element went away between listing and acting — fine
    90 |     }
  > 91 |     if (await page.getByTestId('crash').count()) {
       |                                         ^
    92 |       throw new Error(`crash screen after: ${log.slice(-8).join(' → ')}`);
    93 |     }
  ```

### CR-02 — Dữ liệu hỏng trong DB

- **CR-02 damaged data in the database never crashes a screen** _(iphone)_

  ```
  Error: CR-02 broken people /people: crash screen shown
    - CR-02 broken people /people: crash screen shown getByTestId('crash') with timeout 5000ms
  Error: CR-02 broken people /tree: crash screen shown
    - CR-02 broken people /tree: crash screen shown getByTestId('crash') with timeout 5000ms
  Error: CR-02 broken people /calendar: crash screen shown
    - CR-02 broken people /calendar: crash screen shown getByTestId('crash') with timeout 5000ms
  Error: CR-02 broken people /invite: crash screen shown
    - CR-02 broken people /invite: crash screen shown getByTestId('crash') with timeout 5000ms
  ```

### CR-04 — Mất mạng khi đang lưu

- **CR-04 losing the connection while saving never leaves the form stuck** _(iphone)_

  ```
  Error: CR-04 no answer 10 s after pressing Save offline
  CR-04 no answer 10 s after pressing Save offline
    266 |       { timeout: 10_000, message: 'CR-04 no answer 10 s after pressing Save offline' },
  ```

### CR-05 — Bộ nhớ máy hỏng / bị chặn

- **CR-05 broken or blocked local storage** _(iphone)_

  ```
    299 |   await expectAlive(page, 'CR-05 corrupt storage');
    304 |     await expectAlive(page, `CR-05 corrupt storage ${hash}`);
  ```

### SEC-03 — Mã gia phả

- **SEC-03 share links reveal only that family and are not guessable** _(iphone)_

  ```
  Test timeout of 90000ms exceeded.
  Error: locator.textContent: Test ended.
  Call log:
    - waiting for getByTestId('share-url')
    106 |   await page.goto(`/#/f/${fid}`);
    107 |   await page.goto('/#/invite');
  > 108 |   const url = (await page.getByTestId('share-url').textContent())!;
        |                                                    ^
  ```

### SEC-04 — Thư viện & secret

- **SEC-04 npm audit: no high/critical vulnerabilities in runtime dependencies**

  ```
  low 0, moderate 2, high 4, critical 1
  ```

### UI-02 — Font Nunito + đủ dấu tiếng Việt

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-landscape)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-landscape)_

  ```
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
    280 |   s(r.badFont, `UI-02 ${screen}: text not in Nunito`).toEqual([]);
    281 |   s(r.vietMissing, `UI-02 ${screen}: Vietnamese font subset not loaded`).toBe(false);
  ```

- … và 6 lỗi nữa (xem results.json)

### UI-03 — Vùng chạm ≥ 44×44 px

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-landscape)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-landscape)_

  ```
  Error: UI-03 person-form: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 person-form (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar: tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  Error: UI-03 calendar (bottom): tap targets smaller than 44×44
  > 282 |   s(r.smallTargets, `UI-03 ${screen}: tap targets smaller than 44×44`).toEqual([]);
  ```

- … và 6 lỗi nữa (xem results.json)

### UI-04 — Cỡ chữ đủ đọc

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-landscape)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-landscape)_

  ```
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
    283 |   s(r.tinyText, `UI-04 ${screen}: text smaller than 12px`).toEqual([]);
    284 |   s(r.smallLongText, `UI-04 ${screen}: sentences smaller than 16px`).toEqual([]);
  ```

- … và 6 lỗi nữa (xem results.json)

### UI-05 — Trợ năng + tương phản (WCAG 2 AA)

- **UI-05 accessibility & colour contrast (axe, WCAG 2 AA)** _(ui-iphone-14)_

  ```
  Error: UI-05 settings: serious accessibility problems
  > 362 |       expect.soft(serious, `UI-05 ${sc.name}: serious accessibility problems`).toEqual([]);
  Error: UI-05 person: serious accessibility problems
  > 362 |       expect.soft(serious, `UI-05 ${sc.name}: serious accessibility problems`).toEqual([]);
  Error: UI-05 person-long-name: serious accessibility problems
  > 362 |       expect.soft(serious, `UI-05 ${sc.name}: serious accessibility problems`).toEqual([]);
  Error: UI-05 person-no-space-name: serious accessibility problems
  > 362 |       expect.soft(serious, `UI-05 ${sc.name}: serious accessibility problems`).toEqual([]);
  ```

- **UI-05 accessibility & colour contrast (axe, WCAG 2 AA)** _(ui-desktop-1920)_

  ```
  Error: UI-05 settings: serious accessibility problems
  > 362 |       expect.soft(serious, `UI-05 ${sc.name}: serious accessibility problems`).toEqual([]);
  Error: UI-05 person: serious accessibility problems
  > 362 |       expect.soft(serious, `UI-05 ${sc.name}: serious accessibility problems`).toEqual([]);
  Error: UI-05 person-long-name: serious accessibility problems
  > 362 |       expect.soft(serious, `UI-05 ${sc.name}: serious accessibility problems`).toEqual([]);
  Error: UI-05 person-no-space-name: serious accessibility problems
  > 362 |       expect.soft(serious, `UI-05 ${sc.name}: serious accessibility problems`).toEqual([]);
  ```

### UI-06 — Không nút nào bị che

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search: controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search (bottom): controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search: controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search (bottom): controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search: controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search: controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search (bottom): controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search: controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search: controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-landscape)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search: controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search (bottom): controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-landscape)_

  ```
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search: controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  Error: UI-06 tree-search (bottom): controls covered by something else
  > 285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
    285 |   s(r.covered, `UI-06 ${screen}: controls covered by something else`).toEqual([]);
  ```

- … và 6 lỗi nữa (xem results.json)

### UI-09 — Màn lớn dùng chỗ hợp lý

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se)_

  ```
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se)_

  ```
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-landscape)_

  ```
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-landscape)_

  ```
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
    288 |       s(r.wide.contentW, `UI-09 ${screen}: content column too wide to read`).toBeLessThanOrEqual(
  ```

### UX-04 — Hỏi trước khi phá huỷ

- **UX-04 destructive actions always ask first** _(iphone)_

  ```
  Error: UX-04 closing a family asks first
    - UX-04 closing a family asks first getByTestId('confirm-close-family') with timeout 5000ms
    144 |     'UX-04 closing a family asks first',
  ```

### UX-05 — Form dễ dùng

- **UX-05 forms: focus, inline errors, keep what was typed, Enter saves** _(iphone)_

  ```
  Error: UX-05 name box focused after error
    - UX-05 name box focused after error getByTestId('name') with timeout 5000ms
  > 158 |   await expect(page.getByTestId('name'), 'UX-05 name box focused after error').toBeFocused();
  ```

### UX-06 — Cử chỉ trên cây

- **UX-06 tree gestures: pinch zooms around the fingers, limits, fit, big toggle targets** _(iphone)_

  ```
  Error: UX-06 branch toggle hit area ≥ 44px
    231 |     'UX-06 branch toggle hit area ≥ 44px',
  ```

## Số đo

- CR-03 a 1,000-person family: tree, list, calendar and PDF still work _(iphone)_: timings (ms): {"total":1000,"treeMs":1959}
- UX-01 screens open within 500 ms and buttons react when pressed _(iphone)_: timings (ms): {"home-people":59,"home-tree":65,"home-calendar":58,"home-invite":59}
- UX-01 first load of the built app is under 3 s and the 300-person tree under 1.5 s _(prod)_: timings (ms): {"firstScreen":187,"domContentLoaded":44,"load":44,"tree300":142}
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-iphone-se)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-iphone-14-pro-max)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-galaxy-s8)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-pixel-7)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-iphone-14-landscape)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-ipad-mini)_: skip: scanned on iphone-14 and desktop-1920 only
- UI-05 accessibility & colour contrast (axe, WCAG 2 AA) _(ui-laptop-1366)_: skip: scanned on iphone-14 and desktop-1920 only
- SEC-04 npm audit: no high/critical vulnerabilities in runtime dependencies: low 0, moderate 2, high 4, critical 1
- SEC-04 no secrets committed (Firebase web config is public by design): 95 files scanned
