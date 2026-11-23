# Danh mục test case

Cột **Cách**: `Tự động` (chạy trong `scripts/run-tests.mjs`) · `Tay` (người kiểm trên điện thoại thật) · `Hoãn` (có lý do trong REVIEW_LOG).
Mỗi test tự động có tên bắt đầu bằng mã ở cột ID, nên báo cáo tự ghép kết quả về đúng dòng.

## UI — giao diện (10 cỡ màn hình × chữ thường / chữ to, 19 màn)

| ID    | Nội dung                             | Kết quả mong đợi                                                                     | Cách    | Ở đâu                  |
| ----- | ------------------------------------ | ------------------------------------------------------------------------------------ | ------- | ---------------------- |
| UI-01 | Không tràn ngang, không cắt mép      | Trang không cuộn ngang; mọi nút nằm trong màn hình                                   | Tự động | e2e/ui/screens.spec.ts |
| UI-02 | Font Nunito + đủ dấu tiếng Việt      | Mọi chữ dùng Nunito; bộ chữ tiếng Việt đã tải                                        | Tự động | e2e/ui/screens.spec.ts |
| UI-03 | Vùng chạm ≥ 44×44 px                 | Mọi nút, ô nhập, ô chọn đủ lớn cho ngón tay (Apple HIG)                              | Tự động | e2e/ui/screens.spec.ts |
| UI-04 | Cỡ chữ đủ đọc                        | Không chữ nào < 12 px; câu dài (≥ 25 ký tự) ≥ 16 px                                  | Tự động | e2e/ui/screens.spec.ts |
| UI-05 | Trợ năng + tương phản (WCAG 2 AA)    | axe không báo lỗi mức serious/critical                                               | Tự động | e2e/ui/screens.spec.ts |
| UI-06 | Không nút nào bị che                 | Điểm giữa mỗi nút không bị phần tử khác đè lên                                       | Tự động | e2e/ui/screens.spec.ts |
| UI-07 | Tên rất dài không phá bố cục         | Tên dòng họ 80 ký tự, tên người 100 ký tự, tên liền không dấu cách vẫn đạt UI-01..06 | Tự động | e2e/ui/screens.spec.ts |
| UI-08 | Ảnh bằng chứng mọi màn, không lỗi JS | Có ảnh mọi màn × mọi cỡ; không `pageerror`                                           | Tự động | e2e/ui/screens.spec.ts |
| UI-09 | Màn lớn dùng chỗ hợp lý              | Tablet/desktop: cột nội dung ≤ 760 px; cây chiếm ≥ 90% bề ngang                      | Tự động | e2e/ui/screens.spec.ts |

## UX — trải nghiệm

| ID    | Nội dung                                        | Kết quả mong đợi                                                                                       | Cách    | Ở đâu                         |
| ----- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------- | ----------------------------- |
| UX-01 | Nhanh                                           | Chuyển màn < 500 ms; nút có phản hồi khi nhấn; bản build: màn đầu < 3 s, cây 300 người < 1,5 s         | Tự động | e2e/ux, e2e/prod, e2e/polish  |
| UX-02 | Không ngõ cụt                                   | Màn nào cũng có nút Quay lại; nút Back trình duyệt đi đúng                                             | Tự động | e2e/ux/ux.spec.ts             |
| UX-03 | Bấm đúp không tạo trùng                         | Bấm đúp Lưu / Tạo chỉ tạo 1 người / 1 gia phả                                                          | Tự động | e2e/ux/ux.spec.ts             |
| UX-04 | Hỏi trước khi phá huỷ                           | Xoá người, bỏ thay đổi, đóng gia phả đều hỏi xác nhận; Huỷ giữ nguyên                                  | Tự động | e2e/ux/ux.spec.ts             |
| UX-05 | Form dễ dùng                                    | Tự focus ô tên; lỗi hiện tại chỗ và đưa focus về ô lỗi; giữ nguyên chữ đã gõ; Enter để lưu             | Tự động | e2e/ux/ux.spec.ts             |
| UX-06 | Cử chỉ trên cây                                 | Kéo không mở nhầm; chụm 2 ngón zoom quanh ngón tay; giới hạn zoom; nút toàn cây; nút +/− nhánh ≥ 44 px | Tự động | e2e/ux, e2e/tree              |
| UX-07 | Link sâu sau khi tải lại                        | `/#/p/…`, `/#/tree?focus=…`, `/#/f/…` mở đúng chỗ                                                      | Tự động | e2e/ux/ux.spec.ts             |
| UX-08 | Chữ to                                          | Bật chữ to: chữ lớn hơn, nhớ sau khi tải lại (bố cục chữ to kiểm ở UI-xx)                              | Tự động | e2e/smoke.spec.ts             |
| UX-09 | Trạng thái trống / không thấy / mất mạng        | Có câu giải thích và nút đi tiếp                                                                       | Tự động | e2e/ux, e2e/smoke, e2e/polish |
| UX-10 | Nút chỉ có icon có tên; dùng bàn phím được      | Mọi nút icon có aria-label; Tab tới nút thấy viền focus                                                | Tự động | e2e/ux/ux.spec.ts             |
| UX-11 | Cập nhật trực tiếp                              | Quản trị sửa → máy người xem đổi ngay, không cần tải lại                                               | Tự động | e2e/family.spec.ts            |
| UX-12 | Tự cập nhật bản mới                             | App đã cài nhận bản deploy mới ở lần mở sau                                                            | Tự động | scripts/check-sw-update.mjs   |
| UX-M1 | Mở offline trên iPhone (phần tự động: Chromium) | Thêm vào MH chính, tắt mạng, mở lại vẫn xem cây/lịch                                                   | Tự động | e2e/prod/prod.spec.ts         |
| UX-M2 | Đăng nhập Google trên Safari iPhone             | Đăng nhập được, quay lại app                                                                           | Tay     | iPhone thật                   |
| UX-M3 | Mở link từ Zalo                                 | Link mở được trong trình duyệt của Zalo và trong Safari                                                | Tay     | iPhone thật                   |
| UX-M4 | Người lớn tuổi tự dùng                          | Tự tìm một người, xem cây, xem ngày giỗ mà không cần hỏi                                               | Tay     | Người dùng thật               |

## CR — độ bền

| ID    | Nội dung                  | Kết quả mong đợi                                                                                                    | Cách    | Ở đâu                   |
| ----- | ------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------- |
| CR-01 | Monkey test               | 200 thao tác ngẫu nhiên (seed cố định) × người xem và quản trị: không lỗi JS, không màn báo lỗi                     | Tự động | e2e/crash/crash.spec.ts |
| CR-02 | Dữ liệu hỏng trong DB     | Thiếu tên, cha không tồn tại, vòng lặp, tự lấy mình, ngày sai, `people` là mảng/chuỗi, thiếu meta: mọi màn vẫn hiện | Tự động | e2e/crash/crash.spec.ts |
| CR-03 | Gia phả 1.000 người       | Cây < 5 s, tìm kiếm, lịch, PDF vẫn chạy                                                                             | Tự động | e2e/crash/crash.spec.ts |
| CR-04 | Mất mạng khi đang lưu     | Trong 10 s có phản hồi (đã lưu tạm / báo lỗi), có mạng lại thì dữ liệu lên server                                   | Tự động | e2e/crash/crash.spec.ts |
| CR-05 | Bộ nhớ máy hỏng / bị chặn | localStorage chứa rác hoặc bị chặn: app vẫn mở, xem được gia phả                                                    | Tự động | e2e/crash/crash.spec.ts |
| CR-06 | Đường dẫn lạ              | Route không có, người không có, mã sai: có thông báo, không trắng trang                                             | Tự động | e2e/crash, e2e/family   |
| CR-07 | Fuzz hàm thuần            | Xếp cây 1.000 đồ thị ngẫu nhiên, 5.000 ngày khuyết/sai, 3.000 ngày âm, 2.000 cỡ PDF: không lỗi, giữ bất biến        | Tự động | src/test/fuzz.test.ts   |
| CR-08 | Màn báo lỗi               | Một màn bị lỗi → trang thân thiện, nút Trang chủ khôi phục, lỗi được ghi vào nhật ký                                | Tự động | e2e/crash, e2e/smoke    |

## LG — nghiệp vụ

| ID    | Nội dung             | Kết quả mong đợi                                                                                                                                                            | Cách    | Ở đâu                                               |
| ----- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------- |
| LG-01 | Âm lịch              | Tết 2020–2030; VN khác TQ (1985, 2007, 2030); tháng nhuận; đổi qua lại mọi ngày 1900–2100; năm 12/13 tháng, 353–385 ngày, ~7 năm nhuận/19 năm, Tết trong 21/1–20/2; can chi | Tự động | src/lib/lunar.test.ts, src/test/logic-extra.test.ts |
| LG-02 | Ngày giỗ             | Theo âm lịch ngày mất; mất dương lịch đổi sang âm; tháng nhuận → tháng thường; 30 thiếu → 29; giỗ đầu sau 1 năm; "lần thứ N"                                                | Tự động | dates/events/lunar/logic-extra tests, e2e/calendar  |
| LG-03 | Sinh nhật            | Dương/âm, 29/2 → 28/2, tuổi                                                                                                                                                 | Tự động | src/data/dates.test.ts                              |
| LG-04 | Quan hệ              | Thêm con/vợ chồng/cha/mẹ, nối hai chiều, xoá gỡ liên kết, sửa quan hệ, chặn vòng lặp                                                                                        | Tự động | src/data/people.test.ts, e2e/family, e2e/polish     |
| LG-05 | Xếp cây              | Gốc, dâu rể, thứ tự con, cha mẹ giữa các con, thu gọn, theo nhánh, họ hàng lấy nhau                                                                                         | Tự động | src/tree/layout.test.ts, e2e/tree                   |
| LG-06 | Lịch tháng           | Bắt đầu thứ Hai, ngày âm từng ô, Tết, sắp tới vắt qua năm, đổi ngày                                                                                                         | Tự động | src/calendar/events.test.ts, e2e/calendar           |
| LG-07 | In PDF               | Chia tờ phủ kín, số trang đúng, A3 ít tờ hơn A4, tên file                                                                                                                   | Tự động | src/tree/pdfPlan.test.ts, e2e/pdf                   |
| LG-08 | Tìm kiếm & gợi ý đời | Không dấu, đ/Đ, hoa thường, khoảng trắng; gợi ý đời thứ                                                                                                                     | Tự động | people/logic-extra tests                            |
| LG-09 | Thứ tự anh chị em    | Thứ tự con → năm sinh → tên                                                                                                                                                 | Tự động | people/logic-extra tests                            |
| LG-10 | Nhập & hiển thị ngày | Ngày khuyết, đổi lịch, kiểm tra hợp lệ, "1920 – 1995"                                                                                                                       | Tự động | src/data/dates.test.ts, people.test.ts              |
| LG-11 | Ngôn ngữ             | Tiếng Việt mặc định, đổi tiếng Anh, thiếu thì dùng tiếng Việt                                                                                                               | Tự động | src/i18n, e2e/smoke                                 |
| LG-12 | Mời & nhớ gia phả    | QR + link mở được trên máy khác, nhớ gia phả đã mở, đóng gia phả, đổi tên                                                                                                   | Tự động | e2e/invite.spec.ts                                  |

## SEC — bảo mật

| ID     | Nội dung                | Kết quả mong đợi                                                                                                                                              | Cách    | Ở đâu                                      |
| ------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------ |
| SEC-01 | Rules Firebase          | Chỉ người có mã đọc được; không liệt kê; người xem không ghi; chủ luôn là quản trị; không trường lạ; giới hạn độ dài; không ghi danh sách người khác / gốc DB | Tự động | tests-rules/rules.test.ts                  |
| SEC-02 | XSS                     | Tên/ghi chú/tên dòng họ chứa HTML/JS hiển thị đúng chữ, không chạy ở mọi màn, cây, lịch, PDF, QR                                                              | Tự động | e2e/security/security.spec.ts              |
| SEC-03 | Mã gia phả              | 20 ký tự ngẫu nhiên (crypto), không trùng trong 100.000 mã, phân bố đều; link không lộ gì khác                                                                | Tự động | src/test/logic-extra.test.ts, e2e/security |
| SEC-04 | Thư viện & secret       | `npm audit` không có lỗ hổng high/critical ở thư viện chạy trên máy người dùng; không secret trong repo                                                       | Tự động | scripts/security-scan.mjs                  |
| SEC-05 | Phiên đăng nhập         | Đăng xuất là mất quyền sửa ngay; người xem không tạo được gia phả                                                                                             | Tự động | e2e/security, e2e/smoke                    |
| SEC-06 | Rules trên production   | URL `/.json` của database trả "Permission denied"                                                                                                             | Tay     | Trình duyệt ẩn danh                        |
| SEC-07 | Content-Security-Policy | Có CSP mà app (cả đăng nhập Google) vẫn chạy                                                                                                                  | Hoãn    | xem REVIEW_LOG                             |
