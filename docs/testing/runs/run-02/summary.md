# Kết quả kiểm thử — run-02

- Thời điểm: 2026-11-23 06:14 UTC
- Commit: `6a588ba`
- Môi trường: Chromium (Playwright) giả lập thiết bị, Firebase emulator, Node v22.23.5

## Các bước

| Bước     | Kết quả | Thời gian |
| -------- | ------- | --------- |
| static   | ✅      | 6s        |
| unit     | ✅      | 3s        |
| rules    | ✅      | 6s        |
| e2e      | ❌      | 683s      |
| security | ✅      | 3s        |
| pwa      | ✅      | 14s       |

## Tổng số test

| Bộ       | Đạt | Lỗi | Bỏ qua |
| -------- | --- | --- | ------ |
| e2e      | 6   | 56  | 8      |
| security | 3   | 0   | 0      |
| pwa      | 1   | 0   | 0      |

**Test case lỗi: 33** · thiếu kết quả: CR-07, LG-01, LG-03, LG-08, LG-09, LG-10, SEC-01

## Theo test case

| ID     | Nội dung                                        | Số test | Đạt | Lỗi | Trạng thái         |
| ------ | ----------------------------------------------- | ------- | --- | --- | ------------------ |
| CR-01  | Monkey test                                     | 1       | 0   | 1   | ❌ FAIL            |
| CR-02  | Dữ liệu hỏng trong DB                           | 1       | 1   | 0   | ✅ PASS            |
| CR-03  | Gia phả 1.000 người                             | 1       | 1   | 0   | ✅ PASS            |
| CR-04  | Mất mạng khi đang lưu                           | 1       | 0   | 1   | ❌ FAIL            |
| CR-05  | Bộ nhớ máy hỏng / bị chặn                       | 1       | 0   | 1   | ❌ FAIL            |
| CR-06  | Đường dẫn lạ                                    | 2       | 0   | 2   | ❌ FAIL            |
| CR-07  | Fuzz hàm thuần                                  | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| CR-08  | Màn báo lỗi                                     | 2       | 0   | 2   | ❌ FAIL            |
| LG-01  | Âm lịch                                         | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-02  | Ngày giỗ                                        | 1       | 1   | 0   | ✅ PASS            |
| LG-03  | Sinh nhật                                       | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-04  | Quan hệ                                         | 2       | 0   | 2   | ❌ FAIL            |
| LG-05  | Xếp cây                                         | 1       | 0   | 1   | ❌ FAIL            |
| LG-06  | Lịch tháng                                      | 2       | 2   | 0   | ✅ PASS            |
| LG-07  | In PDF                                          | 1       | 0   | 1   | ❌ FAIL            |
| LG-08  | Tìm kiếm & gợi ý đời                            | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-09  | Thứ tự anh chị em                               | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-10  | Nhập & hiển thị ngày                            | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| LG-11  | Ngôn ngữ                                        | 1       | 0   | 1   | ❌ FAIL            |
| LG-12  | Mời & nhớ gia phả                               | 3       | 0   | 3   | ❌ FAIL            |
| SEC-01 | Rules Firebase                                  | 0       | 0   | 0   | ⚠️ chưa có kết quả |
| SEC-02 | XSS                                             | 2       | 0   | 2   | ❌ FAIL            |
| SEC-03 | Mã gia phả                                      | 1       | 0   | 1   | ❌ FAIL            |
| SEC-04 | Thư viện & secret                               | 3       | 3   | 0   | ✅ PASS            |
| SEC-05 | Phiên đăng nhập                                 | 2       | 0   | 2   | ❌ FAIL            |
| SEC-06 | Rules trên production                           | 0       | 0   | 0   | 🖐 tay / hoãn      |
| SEC-07 | Content-Security-Policy                         | 0       | 0   | 0   | 🖐 tay / hoãn      |
| UI-01  | Không tràn ngang, không cắt mép                 | 20      | 0   | 20  | ❌ FAIL            |
| UI-02  | Font Nunito + đủ dấu tiếng Việt                 | 20      | 0   | 20  | ❌ FAIL            |
| UI-03  | Vùng chạm ≥ 44×44 px                            | 20      | 0   | 20  | ❌ FAIL            |
| UI-04  | Cỡ chữ đủ đọc                                   | 20      | 0   | 20  | ❌ FAIL            |
| UI-05  | Trợ năng + tương phản (WCAG 2 AA)               | 10      | 0   | 2   | ❌ FAIL            |
| UI-06  | Không nút nào bị che                            | 20      | 0   | 20  | ❌ FAIL            |
| UI-07  | Tên rất dài không phá bố cục                    | 20      | 0   | 20  | ❌ FAIL            |
| UI-08  | Ảnh bằng chứng mọi màn, không lỗi JS            | 20      | 0   | 20  | ❌ FAIL            |
| UI-09  | Màn lớn dùng chỗ hợp lý                         | 20      | 0   | 20  | ❌ FAIL            |
| UX-01  | Nhanh                                           | 3       | 1   | 2   | ❌ FAIL            |
| UX-02  | Không ngõ cụt                                   | 1       | 0   | 1   | ❌ FAIL            |
| UX-03  | Bấm đúp không tạo trùng                         | 1       | 0   | 1   | ❌ FAIL            |
| UX-04  | Hỏi trước khi phá huỷ                           | 1       | 0   | 1   | ❌ FAIL            |
| UX-05  | Form dễ dùng                                    | 1       | 0   | 1   | ❌ FAIL            |
| UX-06  | Cử chỉ trên cây                                 | 3       | 0   | 3   | ❌ FAIL            |
| UX-07  | Link sâu sau khi tải lại                        | 1       | 0   | 1   | ❌ FAIL            |
| UX-08  | Chữ to                                          | 1       | 0   | 1   | ❌ FAIL            |
| UX-09  | Trạng thái trống / không thấy / mất mạng        | 3       | 0   | 3   | ❌ FAIL            |
| UX-10  | Nút chỉ có icon có tên; dùng bàn phím được      | 1       | 0   | 1   | ❌ FAIL            |
| UX-11  | Cập nhật trực tiếp                              | 1       | 0   | 1   | ❌ FAIL            |
| UX-12  | Tự cập nhật bản mới                             | 1       | 1   | 0   | ✅ PASS            |
| UX-M1  | Mở offline trên iPhone (phần tự động: Chromium) | 1       | 1   | 0   | ✅ PASS            |
| UX-M2  | Đăng nhập Google trên Safari iPhone             | 0       | 0   | 0   | 🖐 tay / hoãn      |
| UX-M3  | Mở link từ Zalo                                 | 0       | 0   | 0   | 🖐 tay / hoãn      |
| UX-M4  | Người lớn tuổi tự dùng                          | 0       | 0   | 0   | 🖐 tay / hoãn      |

## Chi tiết lỗi

### CR-01 — Monkey test

- **CR-01 monkey test: 200 random actions as a viewer and as an admin** _(iphone)_

  ```
  Test timeout of 600000ms exceeded.
  Error: locator.count: Target page, context or browser has been closed
  ```

### CR-04 — Mất mạng khi đang lưu

- **CR-04 losing the connection while saving never leaves the form stuck** _(iphone)_

  ```
  Error: CR-04 no answer 10 s after pressing Save offline
  Received: false
  ```

### CR-05 — Bộ nhớ máy hỏng / bị chặn

- **CR-05 broken or blocked local storage** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/PMAAQAXKRJULPAWSJVZZ
  ```

### CR-06 — Đường dẫn lạ

- **CR-06 odd addresses: unknown route, missing person, malformed family code** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/khong-co-trang-nay
  ```

- **CR-06 opening a wrong link says so** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/AAAAAAAAAAAAAAAAAAAA
  ```

### CR-08 — Màn báo lỗi

- **CR-08 if a screen crashes, a friendly page appears and Home recovers** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/__crash
  ```

- **CR-08 tapping the title 5 times opens the error log** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/
  ```

### LG-04 — Quan hệ

- **LG-04 UX-11 admin builds a small family; a relative opens the link and can only view** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **LG-04 admin fixes a wrong parent and links two existing people as spouses** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### LG-05 — Xếp cây

- **LG-05 UX-06 tree: full view, open a person, collapse a branch, search, branch view** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/JYMPLEDGVFSQQYHERTXW
  ```

### LG-07 — In PDF

- **LG-07 print the tree to a PDF (one sheet and tiled sheets)** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/QHVRSHKQZCTSZFXYVFKM
  ```

### LG-11 — Ngôn ngữ

- **LG-11 language switch to English and back** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### LG-12 — Mời & nhớ gia phả

- **LG-12 invite screen shows a QR code and the link a relative can open** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/HVPBTYGVNBMNESHDKYXJ
  ```

- **LG-12 admin renames the family; it shows everywhere** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **LG-12 closing a family forgets it on this device** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/FZWKNKYYFELDXCLVYJFL
  ```

### SEC-02 — XSS

- **SEC-02 names and notes with HTML/JS are shown as text, never run** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/PUPMTMGLHDCMLVJNPRSN
  ```

- **SEC-02 typing HTML into the forms stores and shows it as text** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### SEC-03 — Mã gia phả

- **SEC-03 share links reveal only that family and are not guessable** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/GAAWPGRBFFEZKRJYCQRM
  ```

### SEC-05 — Phiên đăng nhập

- **SEC-05 signing out removes editing at once; viewers cannot create a family** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **SEC-05 settings offers Google sign-in for admins** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### UI-01 — Không tràn ngang, không cắt mép

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- … và 8 lỗi nữa (xem results.json)

### UI-02 — Font Nunito + đủ dấu tiếng Việt

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- … và 8 lỗi nữa (xem results.json)

### UI-03 — Vùng chạm ≥ 44×44 px

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- … và 8 lỗi nữa (xem results.json)

### UI-04 — Cỡ chữ đủ đọc

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- … và 8 lỗi nữa (xem results.json)

### UI-05 — Trợ năng + tương phản (WCAG 2 AA)

- **UI-05 accessibility & colour contrast (axe, WCAG 2 AA)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-05 accessibility & colour contrast (axe, WCAG 2 AA)** _(ui-desktop-1920)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### UI-06 — Không nút nào bị che

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- … và 8 lỗi nữa (xem results.json)

### UI-07 — Tên rất dài không phá bố cục

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- … và 8 lỗi nữa (xem results.json)

### UI-08 — Ảnh bằng chứng mọi màn, không lỗi JS

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- … và 8 lỗi nữa (xem results.json)

### UI-09 — Màn lớn dùng chỗ hợp lý

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-small-320)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-se-3)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-iphone-14-pro-max)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-galaxy-s8)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (normal text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- **UI-01 UI-02 UI-03 UI-04 UI-06 UI-07 UI-08 UI-09 every screen (big text)** _(ui-pixel-7)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

- … và 8 lỗi nữa (xem results.json)

### UX-01 — Nhanh

- **UX-01 a 300-person family stays fast** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/CJLEJGEPJVREDZMRDFYC
  ```

- **UX-01 screens open within 500 ms and buttons react when pressed** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/GMTTRXHJFYXRSHAPFJZT
  ```

### UX-02 — Không ngõ cụt

- **UX-02 no dead ends: every screen has a way back, browser Back works** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/BHQSAHVHNTDRUKDVANEU
  ```

### UX-03 — Bấm đúp không tạo trùng

- **UX-03 double-tapping Save or Create does not make duplicates** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### UX-04 — Hỏi trước khi phá huỷ

- **UX-04 destructive actions always ask first** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### UX-05 — Form dễ dùng

- **UX-05 forms: focus, inline errors, keep what was typed, Enter saves** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### UX-06 — Cử chỉ trên cây

- **LG-05 UX-06 tree: full view, open a person, collapse a branch, search, branch view** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/JYMPLEDGVFSQQYHERTXW
  ```

- **UX-06 tree: dragging pans without opening a card** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/KXYEKPDXPHARTVVPPAHA
  ```

- **UX-06 tree gestures: pinch zooms around the fingers, limits, fit, big toggle targets** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/CKNTNBJXNUVNYBTLSJKF
  ```

### UX-07 — Link sâu sau khi tải lại

- **UX-07 deep links keep working after a reload** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/AXFRCCDEKNZBLPUNTBQW
  ```

### UX-08 — Chữ to

- **UX-08 large text setting is remembered after reload** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### UX-09 — Trạng thái trống / không thấy / mất mạng

- **UX-09 works offline: the last-seen family opens without a connection** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/MNWSFSELHFRSWFGGJGYK
  ```

- **UX-09 first open: invites to open a link or create a family** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/
  ```

- **UX-09 empty, missing and offline states explain themselves** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

### UX-10 — Nút chỉ có icon có tên; dùng bàn phím được

- **UX-10 icon-only buttons have names; keyboard users can reach and see focus** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/f/CGKYJMZHZBEJFFKMCPSJ
  ```

### UX-11 — Cập nhật trực tiếp

- **LG-04 UX-11 admin builds a small family; a relative opens the link and can only view** _(iphone)_

  ```
  Error: page.goto: net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5174/#/settings
  ```

## Số đo

- CR-03 a 1,000-person family: tree, list, calendar and PDF still work _(iphone)_: timings (ms): {"total":1000,"treeMs":2566}
- UX-01 first load of the built app is under 3 s and the 300-person tree under 1.5 s _(prod)_: timings (ms): {"firstScreen":226,"domContentLoaded":60,"load":61,"tree300":132}
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
- SEC-04 no secrets committed (Firebase web config is public by design): 102 files scanned
