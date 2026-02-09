# USER STORY – HỆ THỐNG XÂY DỰNG QUẢN LÝ NHÀ TRỌ & THU TIỀN

---

## Role 1: Chủ nhà trọ (Admin)

### US-ADM-01: Quản lý phòng trọ

**As an Admin**, I want tạo, cập nhật, xóa thông tin phòng trọ so that tôi có thể quản lý danh sách phòng và trạng thái phòng.

**Acceptance Criteria:**

* Thêm / sửa / xóa phòng
* Xem trạng thái phòng (trống/đang thuê)
* Phân loại phòng theo khu/tầng

---

### US-ADM-02: Quản lý hợp đồng thuê

**As an Admin**, I want tạo và quản lý hợp đồng thuê phòng so that theo dõi được thời hạn và tình trạng thuê.

**Acceptance Criteria:**

* Tạo hợp đồng mới
* Gán khách thuê vào phòng
* Gia hạn / kết thúc hợp đồng

---

### US-ADM-03: Quản lý khách thuê

**As an Admin**, I want lưu trữ và chỉnh sửa thông tin khách thuê so that quản lý được danh sách người thuê.

**Acceptance Criteria:**

* Lưu thông tin cá nhân khách thuê
* Gắn khách thuê với hợp đồng
* Tìm kiếm khách thuê

---

### US-ADM-04: Thu tiền và công nợ

**As an Admin**, I want tạo hóa đơn và theo dõi công nợ so that kiểm soát doanh thu hàng tháng.

**Acceptance Criteria:**

* Tạo hóa đơn theo tháng
* Theo dõi trạng thái thanh toán
* Tổng hợp công nợ

---

### US-ADM-05: Quản lý điện nước

**As an Admin**, I want nhập chỉ số điện nước hàng tháng so that hệ thống tự động tính tiền.

**Acceptance Criteria:**

* Nhập chỉ số cũ/mới
* Tự động tính tiền
* Lưu lịch sử điện nước

---

### US-ADM-06: Báo cáo và thống kê

**As an Admin**, I want xem báo cáo doanh thu và phòng trống so that đánh giá hiệu quả kinh doanh.

**Acceptance Criteria:**

* Báo cáo doanh thu theo tháng/năm
* Thống kê phòng trống
* Xuất file PDF/Excel (tùy chọn)

---

### US-ADM-07: Quản lý người dùng

**As an Admin**, I want tạo và phân quyền tài khoản người dùng so that hệ thống được quản lý an toàn.

**Acceptance Criteria:**

* Tạo / sửa / xóa tài khoản
* Phân quyền Admin / Staff / Tenant
* Khóa hoặc mở tài khoản

---

### US-ADM-08: Quản lý bảng giá dịch vụ

**As an Admin**, I want cấu hình giá phòng và dịch vụ so that hệ thống tính tiền linh hoạt.

**Acceptance Criteria:**

* Cập nhật giá phòng
* Cập nhật giá điện/nước
* Áp dụng theo thời gian

---

### US-ADM-09: Xử lý yêu cầu từ khách thuê

**As an Admin**, I want quản lý các yêu cầu hỗ trợ so that xử lý kịp thời.

**Acceptance Criteria:**

* Xem danh sách yêu cầu
* Cập nhật trạng thái xử lý

---

### US-ADM-10: Quản lý nhiều khu nhà trọ

**As an Admin**, I want quản lý nhiều khu nhà trọ so that hệ thống có thể mở rộng.

**Acceptance Criteria:**

* Tạo và quản lý nhiều khu
* Gán phòng theo khu

---

## Role 2: Nhân viên quản lý (Staff)

### US-STF-01: Xem danh sách phòng và hợp đồng

**As a Staff**, I want xem thông tin phòng và hợp đồng so that hỗ trợ quản lý hiệu quả.

---

### US-STF-02: Ghi nhận thanh toán

**As a Staff**, I want cập nhật trạng thái thanh toán so that dữ liệu luôn chính xác.

---

### US-STF-03: Nhập chỉ số điện nước

**As a Staff**, I want nhập chỉ số điện nước hàng tháng so that hỗ trợ Admin tính tiền.

---

## Role 3: Khách thuê (Tenant)

### US-TNT-01: Xem thông tin hợp đồng

**As a Tenant**, I want xem thông tin hợp đồng thuê so that biết thời hạn và điều khoản.

---

### US-TNT-02: Xem hóa đơn

**As a Tenant**, I want xem hóa đơn tiền phòng và dịch vụ so that biết số tiền cần thanh toán.

---

### US-TNT-03: Lịch sử thanh toán

**As a Tenant**, I want xem lịch sử thanh toán so that kiểm tra các khoản đã đóng.

---

### US-TNT-04: Gửi yêu cầu hỗ trợ

**As a Tenant**, I want gửi yêu cầu sửa chữa hoặc phản ánh so that được hỗ trợ kịp thời.

---

## Role 4: Hệ thống (System)

### US-SYS-01: Tự động tính tiền

**As a System**, I want tự động tính tiền điện nước so that giảm sai sót.

---

### US-SYS-02: Nhắc hạn thanh toán

**As a System**, I want gửi thông báo nhắc hạn thanh toán so that giảm tình trạng nợ tiền.

---

### US-SYS-03: Ghi log hệ thống

**As a System**, I want ghi lại lịch sử thao tác so that dễ dàng kiểm tra và truy vết.
