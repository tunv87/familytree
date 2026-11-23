# Quy tắc gợi ý xưng hô

Tài liệu để **gia đình duyệt**. App làm theo đúng bảng này (`src/data/kinship.ts`: `ancestorWord`, `uncleWord`, `uncleSpouseWord`…); muốn đổi cách gọi
thì sửa hàm tương ứng và dòng kỳ vọng trong `kinship.test.ts` — test LG-13 kiểm lại cả 3 miền.

- **Mặc định: miền Trung (Bình Định)**. Bắc / Nam chọn được trong Cài đặt.
- "Gọi" = tôi gọi người đó. "Xưng" = tôi tự xưng = cách người đó gọi tôi (app tính ngược lại, không viết riêng).
- **Vai** (thứ bậc nhánh): con nhà anh luôn là anh/chị của con nhà em, **dù ít tuổi hơn**. Vai xét theo "Con thứ mấy
  trong nhà"; chưa nhập thì so năm sinh; thiếu cả hai thì app ghi "anh/chị hoặc em".
- ⚠️ = điểm mình **suy đoán**, cần các cụ xác nhận.

## Đã chốt (user, 23/11/2026)

| Người đó là         | Gọi | Vợ/chồng của họ gọi là |
| ------------------- | --- | ---------------------- |
| Chị, em gái của bố  | cô  | dượng                  |
| Chị, em gái của mẹ  | dì  | dượng                  |
| Em trai của bố      | chú | thím                   |
| Anh, em trai của mẹ | cậu | mợ                     |

## Bảng đầy đủ

### Đời trên (trực hệ)

| Quan hệ            | Trung (Bình Định)  | Bắc         | Nam            | Xưng |
| ------------------ | ------------------ | ----------- | -------------- | ---- |
| Bố / mẹ            | ba / má ⚠️         | bố / mẹ     | ba / má        | con  |
| Ông bà nội / ngoại | ông nội, bà ngoại… | (như Trung) | (như Trung)    | cháu |
| 3 đời trên         | ông cố / bà cố     | cụ          | ông cố / bà cố | chắt |
| 4 đời trên         | ông sơ / bà sơ ⚠️  | kỵ          | ông sơ / bà sơ | chút |
| 5 đời trên trở lên | cụ tổ              | cụ tổ       | cụ tổ          | chít |

### Hàng cô chú bác (anh chị em của bố mẹ, cả họ xa cùng vai)

| Quan hệ           | Trung (Bình Định) | Bắc                      | Nam   |
| ----------------- | ----------------- | ------------------------ | ----- |
| Anh của bố        | bác               | bác                      | bác   |
| Vợ anh của bố     | bác               | bác                      | bác   |
| Em trai của bố    | **chú**           | chú                      | chú   |
| Vợ em trai của bố | **thím**          | thím                     | thím  |
| Chị của bố        | cô ⚠️             | bác                      | cô    |
| Em gái của bố     | **cô**            | cô                       | cô    |
| Chồng của cô      | **dượng**         | bác (chồng chị bố) / chú | dượng |
| Anh của mẹ        | cậu ⚠️            | bác                      | cậu   |
| Em trai của mẹ    | **cậu**           | cậu                      | cậu   |
| Vợ của cậu        | **mợ**            | bác (vợ anh mẹ) / mợ     | mợ    |
| Chị của mẹ        | dì ⚠️             | bác                      | dì    |
| Em gái của mẹ     | **dì**            | dì                       | dì    |
| Chồng của dì      | **dượng**         | bác (chồng chị mẹ) / chú | dượng |

Xưng: **cháu**. Họ xa cùng vai (vd em trai họ của bố) gọi như trên, quan hệ ghi "chú họ".
⚠️ Trung: chị của bố, anh/chị của mẹ **không** gọi bác (giống miền Nam) — cần xác nhận.

### Cùng đời

| Quan hệ                              | Gọi                          | Xưng      |
| ------------------------------------ | ---------------------------- | --------- |
| Anh / chị (ruột hoặc họ, nhánh trên) | anh / chị                    | em        |
| Em (ruột hoặc họ, nhánh dưới)        | em                           | anh / chị |
| Vợ của anh / chồng của chị           | chị (chị dâu) / anh (anh rể) | em        |
| Vợ / chồng của em                    | em (em dâu / em rể)          | anh / chị |
| Chồng / vợ                           | anh / em                     | em / anh  |

### Đời dưới

| Quan hệ                                                  | Gọi                | Xưng                            |
| -------------------------------------------------------- | ------------------ | ------------------------------- |
| Con (con dâu, con rể)                                    | con                | ba/má (Trung, Nam), bố/mẹ (Bắc) |
| Cháu (con của con; con của anh chị em, họ hàng đời dưới) | cháu               | ông/bà, cô/chú/bác/cậu/dì…      |
| 3 đời dưới / 4 đời dưới / 5+                             | chắt / chút / chít | (như đời trên tương ứng)        |

### Họ hàng bên vợ / bên chồng

Gọi **theo cách vợ/chồng mình gọi**: bố mẹ vợ → ba/má, anh của chồng → anh, cậu của vợ → cậu…
⚠️ Nhiều nhà gọi em chồng là "chú/cô" (gọi thay con) — app hiện gọi là "em", cần xác nhận.

### Người chưa xác định

Không nối được qua cha mẹ / vợ chồng (tối đa 12 đời, mỗi đầu 1 lần qua hôn nhân) → "Chưa xác định được quan hệ".
Giới tính "Không rõ" → dạng chung: "anh/chị", "chú/cô", "ông/bà".
