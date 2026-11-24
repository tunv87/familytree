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

## Kết luận — đạt tiêu chí "sạch" (23/11/2026)

- run-04, run-05 xanh; sau T-12 chạy lại 3 lần liên tiếp trên cùng code: **run-06, run-07, run-08 đều 0 case lỗi**,
  không case thiếu kết quả (mỗi run: 115 unit, 21 rules, 63 e2e, 3 security, 1 pwa).
- CI GitHub: bộ nhanh xanh trên mỗi push; **bộ đủ 10 cỡ màn chạy trên CI cũng xanh** (Actions run 19, 8,5 phút).
- Bằng chứng đầy đủ: `runs/run-08/` (summary, results.json, npm-audit.json, 380 ảnh UI: 10 cỡ màn × 19 màn × chữ thường/chữ to).
- Tổng cộng: 23 lỗi sản phẩm (B-01…B-23, trong đó B-14 chấp nhận rủi ro có kiểm chứng) và 12 lỗi của test (T-01…T-12) đã xử lý.
- Còn lại cần làm tay: UX-M2 (đăng nhập Google trên Safari iPhone), UX-M3 (mở link từ Zalo), UX-M4 (người lớn tuổi tự dùng),
  SEC-06 (rules trên production). Hoãn: SEC-07 (Content-Security-Policy).

## Vòng 6 — "Đời thứ" (23/11/2026)

User nhận xét "Đời thứ" khó hiểu và dư thừa. Đánh giá use case: con số **có ích** (gia phả Việt đánh số đời từ thủy tổ;
danh sách chia theo đời) nhưng **nhập tay là sai chỗ** (B-24). Đổi sang tự tính; test case mới LG-14, LG-08 bỏ phần "gợi ý đời".

| #    | Case   | Quyết định                                                                                                                                                                                |
| ---- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-28 | LG-14  | Kiểm theo thuộc tính thay vì chỉ ví dụ: với gia phả ngẫu nhiên 40/300/1.000 người, đời của mỗi người trên cây = hàng của họ + đời gốc − 1                                                 |
| R-29 | LG-14  | Kiểm thời gian: 1.000 người < 200 ms. Lần chạy đầu **đỏ** (1,5 s) vì `findRoots` dùng hàm quét cả gia phả cho mỗi người (O(n²)) → thêm `linkIndex` một lượt; cây cũng nhanh hơn           |
| R-30 | LG-14  | Gia phả cũ đã nhập số: lấy độ lệch xuất hiện nhiều nhất giữa số đã nhập và số tính được (không chỉ của người gốc), để thêm tổ tiên lên trên hoặc một số nhập sai không làm đổi cả gia phả |
| R-31 | SEC-01 | Rules cho `meta/topGeneration`: số nguyên 1–60, chỉ admin                                                                                                                                 |
| R-32 | CR-07  | Fuzz 1.000 đồ thị ngẫu nhiên (vòng, tự liên kết, id treo) cho `computeGenerations`                                                                                                        |

Kết quả: run-09, run-10, run-11 xanh liên tiếp trên `4101155` (130 unit, 22 rules, 65 e2e; LG-14 19/19). Bằng chứng UI mới nhất ở `runs/run-11/`.

## Vòng 7 — Xưng hô (LG-13, 23/11/2026)

Chức năng mới (trước đó chưa có). User chốt miền Trung (Bình Định): cô–dượng, dì–dượng, chú–thím, cậu–mợ.

| #    | Case  | Quyết định                                                                                                                                                                                                                                                                                             |
| ---- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R-33 | LG-13 | Bảng quy tắc viết **trước** code (`XUNG_HO.md`) để gia đình duyệt; các điểm suy đoán đánh dấu ⚠️ (chị của bố/mẹ ở miền Trung, ông sơ, ba/má, gọi em chồng)                                                                                                                                             |
| R-34 | LG-13 | Test theo bảng: một gia đình mẫu 5 đời (~45 người) với mọi vai trong bảng; mỗi dòng kiểm cả "gọi" lẫn "xưng"; 3 miền                                                                                                                                                                                   |
| R-35 | LG-13 | "Xưng" không viết tay mà tính từ chiều ngược → test chiều ngược (chú/thím/mợ/dượng gọi lại cháu) để bắt lỗi bảng                                                                                                                                                                                       |
| R-36 | LG-13 | Vai thắng tuổi: con nhà bác sinh sau vẫn là anh; con nhà chú sinh trước vẫn là em — test riêng                                                                                                                                                                                                         |
| R-37 | LG-13 | Thuộc tính trên gia phả ngẫu nhiên 300 người: quan hệ máu đối xứng (lên/xuống đảo nhau) và khoảng cách đời khớp `computeGenerations` (LG-14); mọi cặp có từ gọi không rỗng; 1 trang hồ sơ trên 1.000 người < 50 ms                                                                                     |
| R-38 | CR-07 | Fuzz 1.000 đồ thị hỏng × mọi cặp × 3 miền                                                                                                                                                                                                                                                              |
| R-39 | UI-01 | B-25 chỉ thấy khi xem ảnh bằng mắt → thêm kiểm "thanh tiêu đề không tên không được xuống dòng"; đã xác nhận kiểm này **đỏ** khi bỏ bản sửa                                                                                                                                                             |
| R-40 | LG-13 | E2E `kinship.spec.ts`: người xem tự chọn "Đây là tôi", kiểm 4 cặp đã chốt + bác/ba/ông nội/anh họ theo vai, nhớ sau khi tải lại, đổi miền Bắc, màn "Gọi nhau thế nào" hai chiều + đường quan hệ bấm được, bỏ chọn trong Cài đặt. Lượt đi UI thêm 2 màn (`kinship-card`, `kinship`) cho 10 cỡ màn + axe |

Kết quả: run-12, run-13, run-14 xanh liên tiếp trên `5dcea33` (202 unit, 22 rules, 66 e2e; LG-13 73/73). Bằng chứng UI mới nhất ở `runs/run-14/` (có 2 màn xưng hô).

## Vòng 8 — Gia đình duyệt bảng xưng hô (23/11/2026)

| #    | Case  | Quyết định                                                                                                                                                                                                                             |
| ---- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-41 | LG-13 | 4 điểm ⚠️: giữ ba/má, giữ cô/cậu/dì không theo vai; **đổi** 4 đời trên → ông kỵ/bà kỵ; **đổi** em của chồng/vợ → chú/cô (gọi thay con). Chỉ cột Trung (Bình Định). Test sửa trước, đỏ đúng 4 chỗ rồi mới sửa code                      |
| R-42 | LG-13 | Test bắt được lỗi logic: "xưng = cách người kia gọi mình" sai với gọi thay con (chị dâu gọi tôi "chú" nhưng tôi vẫn xưng "em") → thêm `theirSelf` cho trường hợp này; một kỳ vọng test viết sai (em chồng xưng "cô") đã sửa thành "em" |

Kết quả: run-15, run-16, run-17 xanh liên tiếp trên cùng code `992d2df` (208 unit, 22 rules, 66 e2e; LG-13 79/79). Bằng chứng UI mới nhất ở `runs/run-17/`.

## Vòng 9 — Ảnh đại diện + Nơi ở (LG-15, LG-16, 24/11/2026)

Làm mock trước (https://claude.ai/artifact/KQF33a7n8P3GyVGmV9pczu); user chọn: ô cây kiểu B, mặc định hình người,
hồ sơ/danh sách như mock, PDF mặc định "Có ảnh".

| #    | Case   | Quyết định                                                                                                                                                                                     |
| ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-43 | LG-15  | Ảnh lưu trong Realtime Database (Storage cần gói trả phí), **ngoài** `families/<fid>` để dữ liệu gia phả không phình; 2 cỡ: thumb 96 px cho danh sách/cây/PDF, ảnh 320 px chỉ tải khi mở hồ sơ |
| R-44 | SEC-01 | Rules ảnh: người xem đọc được, chỉ quản trị **của gia phả đó** ghi; chỉ nhận `data:image/jpeg;base64,` trong giới hạn (chặn SVG, link ngoài, chuỗi quá dài)                                    |
| R-45 | LG-15  | E2E dùng ảnh điện thoại thật cỡ dọc có thẻ EXIF xoay; kiểm ảnh lưu đúng 320×320, nằm ngoài dữ liệu người; người xem thấy ảnh, không có nút Đổi ảnh                                             |
| R-46 | LG-15  | Lần chạy đầu 4 test đỏ do **test** mở thẳng `/#/edit/...` (app quay về màn trước sau khi lưu) → test đi như người dùng: hồ sơ → Sửa. Không phải lỗi app                                        |
| R-47 | CR-02  | File không phải ảnh, và file đuôi .jpg nhưng hỏng → báo lỗi thân thiện, form vẫn lưu được                                                                                                      |
| R-48 | UI     | Lượt đi UI seed ảnh cho vài người (ảnh và hình mặc định cạnh nhau) trên 10 cỡ màn + axe                                                                                                        |

Kết quả: run-18, run-19, run-20 xanh liên tiếp trên `6deb7ad` (215 unit, 24 rules, 70 e2e; LG-15 8/8, LG-16 4/4). Bằng chứng UI mới nhất (có ảnh đại diện) ở `runs/run-20/`.

## Vòng 10 — Ô trên cây: đã mất, năm sinh + nơi ở, danh xưng (LG-17, 24/11/2026)

Mock trước (trang "Ô cây" trong https://claude.ai/artifact/KQF33a7n8P3GyVGmV9pczu); user chọn: đã mất D3 với mẫu
"(1960–2022), 20/8 ÂL"; còn sống bỏ chữ "Sinh"; danh xưng K1 (nhãn đỏ trên mép ô).

| #    | Case  | Quyết định                                                                                                                                                                                     |
| ---- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-49 | LG-17 | Nhãn dùng từ gọi; khi từ gọi chung chung (anh/chị/em/con) thì ghi quan hệ cụ thể (Vợ, Em gái, Em rể, Con trai) — test theo đúng cây user gửi                                                   |
| R-50 | LG-17 | Lần chạy e2e đầu đỏ: Lập ghi "Chị hoặc em" vì dữ liệu **test** thiếu thứ tự con của Tự — app đúng; sửa dữ liệu test                                                                            |
| R-51 | LG-17 | Xem ảnh 1:1 thấy nhãn dài ("Em trai") đè dòng tên 2 dòng (mock không lộ vì ô mock có khoảng trống trên) → đẩy nhãn lên trên mép ô; thêm kiểm hình học "nhãn không thấp hơn mép trên ô" vào e2e |

Kết quả: run-21, run-22, run-23 xanh liên tiếp trên `7732787` (230 unit, 24 rules, 71 e2e; LG-17 16/16). Bằng chứng UI mới nhất ở `runs/run-23/`.

## Vòng 11 — Nút Trang chủ + ← về màn cha (UX-13, 24/11/2026)

User: "nút back về trang trước UX chưa ok → về parent page; thêm nút Trang chủ ở các màn con". Mock trước (trang
"Điều hướng"); user chọn 🏠 góc phải (H2), duyệt sơ đồ màn cha, hồ sơ mở từ Cây/Lịch thì ← về chỗ đó (P2).

| #    | Case  | Quyết định                                                                                                                                                                                      |
| ---- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-52 | UX-13 | Sơ đồ màn cha là hàm thuần `parentPath` → test bảng 24 dòng (mọi màn + tham số `?parent/spouse/child/first/root/a/b`)                                                                           |
| R-53 | UX-13 | ← "lùi" khi màn trước đúng là màn cha (giữ nút back của điện thoại hoạt động), còn lại thay bằng màn cha — e2e kiểm link sâu sau khi tải lại không văng ra ngoài, Sửa→Lưu→← không quay vào form |
| R-54 | UX-02 | Giữ nguyên (mọi màn có nút quay lại, back trình duyệt vẫn đúng) — xanh với cách mới                                                                                                             |

Kết quả: run-24, run-25, run-26 xanh liên tiếp trên `bdae35f` (254 unit, 24 rules, 72 e2e; UX-13 25/25). Bằng chứng UI mới nhất ở `runs/run-26/`.

## Vòng 12 — Đợt 1 cho người lớn tuổi (LG-18, UX-14…17, 24/11/2026)

Từ báo cáo benchmark; mock trước, user chọn: nhắc trước 3 ngày + 1 ngày, hướng dẫn đủ 3 bước, chữ dưới nút luôn hiện,
"Sắp tới" + Hoàn tác như mock.

| #    | Case  | Quyết định                                                                                                                                                                    |
| ---- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R-55 | LG-18 | Lần chạy e2e đầu đỏ: mở ngày 1/4 thì giỗ Tết năm nay đã qua → bà chỉ có 9 lần nhắc. Lỗi app thật: đổi thành "10 lần giỗ kế tiếp mỗi người", thêm unit test cho trường hợp này |
| R-56 | LG-18 | Kiểm file .ics thật tải về từ trình duyệt (số sự kiện, ngày, 2 lời nhắc), không chỉ hàm tạo file                                                                              |
| R-57 | UX-14 | Test cũ mở link giả định vào thẳng trang chủ → đánh dấu "đã xem hướng dẫn" sẵn cho test cũ; test riêng dùng máy mới chưa xem. UI walk có thêm 3 màn hướng dẫn + bảng tin nhắn |
| R-58 | UX-17 | Hoàn tác xoá kiểm bằng người có cha, vợ và con (không phải người lẻ) để chắc liên kết cũng quay lại; unit test xoá → hoàn tác = y như cũ                                      |
| R-59 | UI    | UI walk cố định ngày 1/4/2027 để "Sắp tới" và nút "Nhắn cả nhà" luôn có trên ảnh                                                                                              |
