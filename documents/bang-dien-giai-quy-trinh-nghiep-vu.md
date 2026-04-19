# Bảng diễn giải quy trình hoạt động nghiệp vụ — Hệ thống quản lý nhà trọ (iTro)

Mỗi **một quy trình** tương ứng **một bảng** (cột: STT, Hoạt động, Input Data, Output Data, End User). Sơ đồ PlantUML cùng tên: thư mục [`quy-trinh-nghiep-vu-2.1.2/`](quy-trinh-nghiep-vu-2.1.2/README.md).

**Chú thích:** QT = Quản trị viên; NV = Nhân viên; KT = Khách thuê; HT = Hệ thống (tự động).

**Gợi ý đánh số trong luận văn:** Bảng 2.1 … Bảng 2.11 lần lượt theo thứ tự dưới đây (hoặc đổi thứ tự cho khớp chương).

---

### Bảng 2.1 — Quy trình tổng quan vận hành *(Hình 2.1 — `01-tong-quan-van-hanh.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Cấu hình nền (khu, phòng, giá) | Thông tin danh mục, giá dịch vụ | Dữ liệu master trong CSDL | QT, NV |
| 2 | Tiếp nhận khách và hợp đồng | Hồ sơ khách, phòng, điều khoản | Hợp đồng hiệu lực | QT, NV |
| 3 | Ghi nhận chỉ số & hóa đơn kỳ | Chỉ số điện nước, kỳ tháng/năm | Hóa đơn, tiền các khoản | QT, NV; HT |
| 4 | Thông báo / nhắc thanh toán | Hóa đơn chưa TT, kênh liên lạc | Thông điệp gửi cho khách | QT, NV; KT |
| 5 | Khách thanh toán | Hóa đơn, cổng thanh toán hoặc nộp tại BQL | Trạng thái đã thanh toán | KT; QT, NV |
| 6 | Đối soát & báo cáo | Dữ liệu HĐ, thanh toán theo kỳ | Báo cáo doanh thu, công nợ | QT, NV |

---

### Bảng 2.2 — Quy trình tiếp nhận khách, hợp đồng và gán phòng *(Hình 2.2 — `02-hop-dong-khach-phong.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Tạo / cập nhật hồ sơ khách thuê | Họ tên, SĐT, CCCD, địa chỉ, email, ảnh (nếu có) | Bản ghi `khach_thue` | QT, NV |
| 2 | Chọn phòng trống phù hợp | Danh sách phòng, trạng thái, giá | Phòng được chọn cho HĐ | QT, NV |
| 3 | Nhập điều khoản hợp đồng | Ngày bắt đầu/kết thúc, tiền cọc, tiền thuê, … | Bản nháp / hợp đồng | QT, NV |
| 4 | Lưu hợp đồng hiệu lực | Dữ liệu đã kiểm tra | Hợp đồng ACTIVE; cập nhật trạng thái phòng (nếu có) | QT, NV |
| 5 | Gắn tài khoản TENANT (nếu cần) | User mới hoặc user có sẵn + khách thuê | Liên kết đăng nhập ↔ hồ sơ khách | QT |
| 6 | Khách xem hợp đồng / phòng (app) | Phiên đăng nhập KT | Thông tin hiển thị theo quyền | KT |

---

### Bảng 2.3 — Quy trình chỉ số điện nước và hóa đơn theo kỳ *(Hình 2.3 — `03-chi-so-hoa-don-ky.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Chọn phòng — kỳ có hợp đồng hiệu lực | Phòng, tháng/năm | Ngữ cảnh nhập chỉ số | QT, NV |
| 2 | Nhập chỉ số công tơ mới | Điện mới, nước mới (cùng kỳ) | Bản ghi `chi_so_dien_nuoc` | QT, NV |
| 3 | Hệ thống tính sản lượng & tiền | Chỉ số, bảng giá, giá phòng | Tiền điện, tiền nước, tiền phòng (logic HT) | HT |
| 4 | Tạo hoặc cập nhật hóa đơn | Tổng hợp khoản phải thu, chi tiết phát sinh (nếu có) | `hoa_don`, `hoa_don_chi_tiet`; trạng thái UNPAID | QT, NV; HT |
| 5 | Kiểm tra trước khi gửi khách | Hóa đơn, tổng tiền | Xác nhận nội bộ | QT, NV |

---

### Bảng 2.4 — Quy trình thanh toán trực tuyến PayOS *(Hình 2.4 — `04-thanh-toan-payos.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Khách chọn hóa đơn chưa thanh toán | Phiên KT; mã hóa đơn thuộc khách | Điều hướng tạo giao dịch | KT |
| 2 | Tạo link / QR thanh toán PayOS | Mã hóa đơn, số tiền (backend gọi API PayOS) | `paymentUrl` hoặc QR | KT |
| 3 | Thanh toán trên cổng PayOS | Thẻ / app ngân hàng của khách | Kết quả tại cổng (thành công/thất bại) | KT |
| 4 | PayOS gửi webhook | JSON ký sự kiện, checksum | Xác thực chữ ký | HT |
| 5 | Cập nhật sau thanh toán thành công | Mã giao dịch, mã hóa đơn | Hóa đơn PAID; bản ghi giao dịch | HT |

---

### Bảng 2.5 — Quy trình xác thực và tài khoản *(Hình 2.5 — `05-xac-thuc-tai-khoan.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Đăng ký (tuỳ chọn) | Tên đăng nhập, mật khẩu, họ tên, SĐT, vai trò đăng ký | Người dùng mới (mật khẩu mã hóa) | Người dùng mới |
| 2 | Đăng nhập | Tên đăng nhập, mật khẩu | JWT / phiên làm việc | QT, NV, KT |
| 3 | Kiểm tra kích hoạt & mật khẩu | Thông tin đăng nhập | Cho phép / từ chối vào hệ thống | HT |
| 4 | Quên mật khẩu | Email hoặc tài khoản đã đăng ký | Phiếu token; email có link đặt lại | Người dùng |
| 5 | Đặt lại mật khẩu | Token hợp lệ, mật khẩu mới | Cập nhật mật khẩu; vô hiệu token | Người dùng |

---

### Bảng 2.6 — Quy trình yêu cầu hỗ trợ và thông báo *(Hình 2.6 — `06-yeu-cau-ho-tro-thong-bao.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Khách gửi yêu cầu hỗ trợ | Tiêu đề, mô tả, phòng liên quan (nếu có) | Ticket mới | KT |
| 2 | BQL tiếp nhận & xử lý | Nội dung ticket, phản hồi | Trạng thái ticket cập nhật | QT, NV |
| 3 | Soạn thông báo | Nội dung; chọn người nhận (theo phòng / user) | Bản ghi `thong_bao` | QT |
| 4 | Gửi thông báo đến người nhận | Danh sách đích | Thông báo hiển thị trên app | QT, NV, KT |
| 5 | Người nhận đọc thông báo | Phiên đăng nhập; ID thông báo | Cờ đã đọc (nếu có) | QT, NV, KT |

---

### Bảng 2.7 — Quy trình quản lý người dùng (quản trị viên) *(Hình 2.7 — `07-quan-ly-nguoi-dung-admin.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Tạo tài khoản mới | Tên đăng nhập, mật khẩu, vai trò, họ tên, SĐT | Người dùng mới trong CSDL | QT |
| 2 | Sửa thông tin / đổi mật khẩu | Dữ liệu chỉnh sửa theo form | Bản ghi `nguoi_dung` cập nhật | QT |
| 3 | Khóa / mở khóa tài khoản | ID user; trạng thái kích hoạt | Cập nhật cờ kích hoạt | QT |
| 4 | Gắn / bỏ gắn khách thuê | User TENANT + mã khách hoặc tạo khách mới | Liên kết `nguoi_dung` ↔ `khach_thue` | QT |
| 5 | Xác nhận danh sách | — | Hiển thị danh sách sau thao tác | QT |

---

### Bảng 2.8 — Quy trình cấu hình danh mục: khu vực, phòng, bảng giá *(Hình 2.8 — `08-danh-muc-khu-phong-bang-gia.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Khai báo / sửa / xóa khu vực | Tên, địa chỉ, mô tả; điều kiện xóa (theo nghiệp vụ) | Bản ghi `khu_vuc` | QT; NV (xem) |
| 2 | Thêm / sửa phòng | Mã phòng, khu, tầng, diện tích, giá hiện tại, trạng thái | Bản ghi `phong` | QT, NV |
| 3 | Thiết lập bảng giá điện — nước | Đơn giá, ngày hiệu lực | Bản ghi `bang_gia_dich_vu` mới | QT |
| 4 | Sử dụng danh mục khi lập HĐ / chỉ số | Tra cứu phòng, giá | Dữ liệu tham chiếu | QT, NV |

---

### Bảng 2.9 — Quy trình xem báo cáo và thống kê *(Hình 2.9 — `09-bao-cao-thong-ke.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Đăng nhập và vào mục báo cáo | Phiên QT/NV | Quyền truy cập API báo cáo | QT, NV |
| 2 | Chọn loại báo cáo & kỳ | Tham số thời gian, bộ lọc (theo API) | Truy vấn dữ liệu hóa đơn, phòng, thu | HT |
| 3 | Xem kết quả | — | Bảng số liệu, biểu đồ trên giao diện | QT, NV |
| 4 | (Tuỳ chọn) Xuất / in | — | File hoặc bản in nội bộ | QT, NV |

---

### Bảng 2.10 — Quy trình tra cứu nhật ký hệ thống *(Hình 2.10 — `10-nhat-ky-he-thong.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Vào mục nhật ký (chỉ admin) | Phiên QT có quyền | Danh sách bản ghi nhật ký | QT |
| 2 | Lọc theo thời gian / loại thao tác | Tham số lọc | Tập bản ghi khớp điều kiện | QT |
| 3 | Đọc chi tiết một dòng nhật ký | ID bản ghi | Người thực hiện, hành động, đối tượng, thời gian | QT |

---

### Bảng 2.11 — Quy trình ghi nhận thanh toán nội bộ *(Hình 2.11 — `11-ghi-nhan-thanh-toan-noi-bo.puml`)*

| STT | Hoạt động | Input Data | Output Data | End User |
|-----|-----------|------------|-------------|----------|
| 1 | Chọn hóa đơn cần ghi nhận | Mã hóa đơn, số tiền khách đã nộp | — | QT, NV |
| 2 | Chọn phương thức (tiền mặt / chuyển khoản) | `CASH` hoặc `TRANSFER` | — | QT, NV |
| 3 | Gửi yêu cầu ghi nhận (API) | `invoiceId`, `amount`, phương thức | Bản ghi `thanh_toan` | HT |
| 4 | Cập nhật trạng thái hóa đơn | Kết quả kiểm tra số tiền & HĐ | Hóa đơn đã thanh toán / một phần (theo logic) | HT |
| 5 | Đối soát với sổ quỹ (nội bộ) | Chứng từ ngoài hệ thống | Khớp số liệu | QT, NV |

---

## Liên kết tài liệu

- Sơ đồ PlantUML: [`quy-trinh-nghiep-vu-2.1.2/`](quy-trinh-nghiep-vu-2.1.2/README.md)  
- Đối chiếu Controller: [`quy-trinh-nghiep-vu-2.1.2/DOI-CHIEU-CHUC-NANG.md`](quy-trinh-nghiep-vu-2.1.2/DOI-CHIEU-CHUC-NANG.md)  
- Mục 2.1.2 tổng quan: [`2.1.2-SO-DO-NGHIEP-VU.md`](2.1.2-SO-DO-NGHIEP-VU.md)

---

*Trong Word: mỗi khối `### Bảng 2.x` có thể tách thành một bảng có chú thích dưới hình tương ứng.*
