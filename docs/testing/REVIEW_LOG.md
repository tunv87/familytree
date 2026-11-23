# Nhật ký review test case

Checklist khi review mỗi case: (1) có bám một rủi ro thật với người dùng không, (2) kết quả mong đợi có đúng
và đo được không, (3) có dễ chập chờn không (dùng chờ trạng thái thay vì ngủ cố định), (4) có trùng case khác không,
(5) có tạo dương tính giả không.

## Vòng 1 — review trước lần chạy đầu (23/11/2026)

Đã review toàn bộ 52 case (UI 9, UX 16, CR 8, LG 12, SEC 7).
Giữ nguyên 43 case (R-10 xem lại nhưng giữ); sửa 6 (R-01, 02, 03, 04, 09, 11); thu hẹp phạm vi 1 (R-07);
chuyển từ tay sang tự động 1 (R-08); hoãn 1 (R-06); thêm kịch bản cho 1 case (R-12); xoá 1 file test trùng (R-05). Chi tiết:

| #    | Case     | Vấn đề tìm thấy                                                                                                                                                           | Quyết định                                                                                                                                                                                                |
| ---- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-01 | UI-06    | Ô tìm kiếm ở màn Danh sách "dính" ở đầu trang (sticky). Khi cuộn, các dòng chạy xuống dưới nó, test sẽ báo "nút bị che" dù đó là hành vi đúng → **dương tính giả**        | Sửa: không tính khi thứ nằm trên là thanh sticky/fixed (trừ nền tối của hộp thoại)                                                                                                                        |
| R-02 | UX-03    | Có đoạn code đọc `users/<uid>` bằng một biến không bao giờ được gán (`__uid`), không kiểm gì                                                                              | Sửa: bỏ đoạn thừa; việc đếm số gia phả đã có ở bước kiểm danh sách                                                                                                                                        |
| R-03 | CR-01    | Monkey có thể bấm "Đăng nhập Google" (mở popup, treo test), "Đăng xuất" (biến lượt quản trị thành người xem) và "Gửi link" (mở bảng chia sẻ của hệ điều hành)             | Sửa: loại 3 nút này khỏi tập thao tác ngẫu nhiên; các nút còn lại (kể cả Xoá, In PDF) vẫn được bấm                                                                                                        |
| R-04 | CR-04    | Chế độ offline của Chromium có thể giữ nguyên WebSocket đang mở tới emulator, nên test có thể "đạt" mà không hề mất mạng → **kiểm không có tác dụng**                     | Sửa: thêm hook test `__testNetwork` (chỉ có khi chạy emulator) gọi `goOffline/goOnline` của Firebase để ngắt kết nối chắc chắn                                                                            |
| R-05 | UI-01/02 | `e2e/ui-consistency.spec.ts` (chỉ iPhone 14) trùng hoàn toàn với ma trận UI mới                                                                                           | Xoá file cũ                                                                                                                                                                                               |
| R-06 | SEC-07   | CSP qua thẻ meta có thể chặn script/iframe đăng nhập Google của Firebase. Ở đây không gọi được Google/Firebase thật để kiểm, mà nếu sai thì quản trị không đăng nhập được | **Hoãn**. Đã có lớp bảo vệ khác: React tự escape mọi chữ, chỗ duy nhất dùng `dangerouslySetInnerHTML` là SVG mã QR do thư viện sinh từ link (không chứa dữ liệu người dùng), và SEC-02 kiểm XSS ở mọi màn |
| R-07 | UI-05    | Chạy axe trên cả 9 cỡ màn hình tốn ~10 phút, trong khi các luật axe (tên nút, tương phản) gần như không phụ thuộc cỡ màn                                                  | Chạy trên iPhone 14 + desktop 1920; ghi rõ lý do trong test (`test.skip`)                                                                                                                                 |
| R-08 | UX-M1    | Ban đầu là test tay. Phần "mở được khi không có mạng" kiểm tự động được bằng bản build thật + service worker trong Chromium                                               | Chuyển thành tự động (`e2e/prod`). Phần "thêm vào MH chính trên iPhone" vẫn cần kiểm tay, nằm trong hướng dẫn mục B                                                                                       |
| R-09 | UX-01    | Đo thời gian chuyển màn trên dev server: lần đầu Vite còn biên dịch module nên chậm giả                                                                                   | Sửa: chạy làm nóng 1 lượt trước khi đo; thời gian tải lần đầu đo trên bản build thật (`e2e/prod`)                                                                                                         |
| R-10 | UI-04    | Ngưỡng "≥ 16 px cho câu dài": có đúng chuẩn không?                                                                                                                        | Giữ. Apple khuyên 17 pt, Material 16 sp cho chữ nội dung; người dùng chính là người lớn tuổi. Chữ ngắn (nhãn, số âm lịch) cho phép ≥ 12 px                                                                |
| R-11 | CR-02    | Thiếu trường hợp phần tử trong `people` không phải object (số, chuỗi)                                                                                                     | Thêm `junk000001: 5`, `junk000002: 'chỉ là chữ'`                                                                                                                                                          |
| R-12 | SEC-01   | Rules chưa có test cho việc một quản trị được thêm sau gỡ quyền của chủ gia phả (chiếm quyền)                                                                             | Thêm vào bộ "SEC-01 more attacks" (dự đoán sẽ lỗi)                                                                                                                                                        |

Ghi chú: các case UX-04 (đóng gia phả không hỏi), UX-05 (focus khi lỗi), UX-06 (nút +/− nhỏ),
UI-03/04 (vài nút, chữ nhỏ) được viết theo **hành vi mong muốn**, nên dự đoán sẽ lỗi ở lần chạy đầu. Đây là chủ ý,
không phải test sai.

## Vòng 2 — sau run-01 (23/11/2026)

Review lại các case lỗi trong run-01: 14 lỗi sản phẩm (B-01…B-14, xem BUGS.md), 7 lỗi do test/báo cáo:

| #           | Case                             | Vấn đề                                                                                               | Quyết định                                                                                                                                                                             |
| ----------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-13 (T-01) | báo cáo                          | Thông báo lỗi Playwright có trích đoạn code chứa chữ "UI-02" → báo cáo gán lỗi UI-02 oan cho mọi máy | Chỉ lấy mã ở dòng đầu của mỗi lỗi; in thêm danh sách phần tử lỗi (phần "Received") để đọc được ngay                                                                                    |
| R-14 (T-02) | CR-07, LG-01/03/08/09/10, SEC-01 | Vitest có 2 reporter nên `--outputFile` không áp dụng cho JSON → không có kết quả                    | Dùng `--outputFile.json=`                                                                                                                                                              |
| R-15 (T-03) | UI-xx                            | 19 màn × (2 lần kiểm + ảnh) vượt 90 s trên máy chậm                                                  | Timeout 300 s; ảnh bằng chứng chỉ chụp khung nhìn (không chụp cả trang) dạng JPEG để repo không phình (run-01 cả trang = 49 MB)                                                        |
| R-16 (T-04) | CR-01                            | 300 thao tác × 2 vai vượt 240 s                                                                      | 200 thao tác/vai, timeout 600 s, mỗi thao tác tối đa 800 ms                                                                                                                            |
| R-17 (T-05) | SEC-03                           | Đua giữa lệnh tự chuyển trang của link mời và `goto` kế tiếp                                         | Chờ trang chủ hiện rồi mới mở màn Mời                                                                                                                                                  |
| R-18 (T-06) | UX-06                            | Điều hướng cùng route `/tree` → `/tree?focus=` không mount lại cây nên vẫn ở mức thu nhỏ             | Mở cây từ trang hồ sơ (như người dùng thật bấm "Xem trên cây")                                                                                                                         |
| R-19 (T-07) | UI-06                            | Popup kết quả tìm kiếm đè nút zoom là hành vi đúng (popup tạm thời)                                  | Cho phép phần tử `role="listbox"` đè lên; gắn `role="listbox"` cho popup                                                                                                               |
| R-20 (T-08) | UI-xx                            | Profile `iPhone SE` của Playwright là đời đầu (320 px), không phải 375 px như kế hoạch               | Thêm `iphone-se-3` (375 px) và **giữ** màn 320 px dưới tên `small-320`: người lớn tuổi hay bật "cỡ hiển thị lớn" trên Android khiến bề ngang chỉ ~320 px. Ma trận thành 10 cỡ màn hình |

## Vòng 3 — sau run-02 (23/11/2026)

run-02 không dùng được để đánh giá sản phẩm: dev server chết giữa chừng nên 56 test sau đó báo "connection refused".

| #           | Case    | Vấn đề                                                                       | Quyết định                                                                          |
| ----------- | ------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| R-21 (T-09) | báo cáo | Playwright dọn `test-results/` khi khởi động → JSON unit/rules bị xoá        | Ghi JSON vitest vào `.reports/`                                                     |
| R-22 (T-10) | CR-01   | Lệnh đọc nhãn phần tử không có timeout → monkey đứng chờ phần tử đã biến mất | Mọi lệnh trong monkey có timeout 800 ms; in tiến độ mỗi 50 bước; timeout test 300 s |
| R-23        | LG-12   | Chưa kiểm trường hợp clipboard bị chặn (phát hiện từ log monkey, B-17)       | Thêm test: clipboard bị chặn → có thông báo + link được bôi đen sẵn                 |

## Vòng 4 — sau run-03 (23/11/2026)

run-03: unit, rules, security, pwa, mọi case CR/LG/SEC/UX đều đạt. Lỗi còn lại đều ở lượt đi màn UI:
mọi máy điện thoại treo ở bước `delete-confirm` (bấm "Xoá" trúng dòng khác) → B-18; axe → B-19; màn ngang báo che nút zoom.

| #           | Case  | Vấn đề                                                                                                      | Quyết định                                                                                          |
| ----------- | ----- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| R-24 (T-11) | UI-01 | Kiểm tràn ngang bằng `scrollWidth − innerWidth`; trên điện thoại `innerWidth` nở theo nội dung nên luôn = 0 | So với bề ngang khung nhìn của thiết bị (`page.viewportSize()`), dùng nó cho mọi kiểm theo bề ngang |
| R-25        | UI-06 | Ngoại lệ "popup đè lên" dựa vào `role="listbox"` buộc sản phẩm gắn vai trò ARIA sai (B-19)                  | Đánh dấu popup bằng thuộc tính riêng `data-popup`; popup dùng `<ul aria-label>` đúng ngữ nghĩa      |
| R-26        | —     | `prettier --check` báo lỗi định dạng ở file kết quả run do script sinh ra                                   | Bỏ `docs/testing/runs` khỏi prettier (bằng chứng giữ nguyên như khi sinh ra)                        |

Kiểm lại sau khi sửa (chạy riêng UI ở 5 cỡ: small-320, iphone-14, pixel-7, iphone-14-landscape, desktop-1920):
UI-01 bản mới bắt thêm trang hồ sơ của người tên không khoảng trắng (lỗi có từ trước, bị che bởi T-11);
lượt axe trước đây dừng ở tree-search nên chưa tới lịch (B-22). Lần sửa đầu dùng `overflow-wrap: anywhere` cho cả trang
làm tiêu đề bị ngắt từng chữ cái → đổi sang `break-word` cho toàn trang, `anywhere` chỉ cho tên người.
Sau khi sửa B-18…B-23: 12/12 test UI xanh trên 5 cỡ màn.

## Vòng 5 — run-04 và CI đầu tiên (23/11/2026)

run-04 xanh (0 case lỗi) — lần xanh 1/3. CI chạy bộ mới lần đầu (bộ máy nhanh, 3,2 phút): 45/46 đạt, 1 lỗi chập chờn
chỉ thấy trên máy CI:

| #           | Case         | Vấn đề                                                                     | Quyết định                                                                                                                                                  |
| ----------- | ------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-27 (T-12) | LG-04, UX-11 | Test tự chuyển trang trong lúc app cũng đang tự quay lại sau khi xoá (đua) | Chờ app rời trang hồ sơ rồi mới mở danh sách; kiểm thêm người bị xoá không còn trong danh sách. Rà các test khác: không còn chỗ nào bấm xoá rồi `goto` ngay |
