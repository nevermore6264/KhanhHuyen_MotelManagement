# Quy trình nghiệp vụ — Mục 2.1.2 (hệ thống iTro)

Thư mục gom **các quy trình tách theo lĩnh vực**. Mỗi file `.puml` tương ứng **một hình** trong luận văn; xuất PNG/SVG bằng PlantUML rồi chèn vào Word.

## Vì sao không chỉ một vài sơ đồ?

- **Hình 2.1 (`01`)** là **tổng quan** (end-to-end), không thay thế các bước chi tiết.
- Bản đầu **7 sơ đồ** đã bao phủ luồng chính (thuê, hóa đơn, PayOS, xác thực, hỗ trợ, user).
- Sau khi **đối chiếu toàn bộ `Controller` backend**, bổ sung **4 sơ đồ** cho các nhóm trước đây chỉ “lồng” trong tổng quan hoặc dễ nhầm với PayOS:
  - Danh mục **khu — phòng — bảng giá**
  - **Báo cáo / thống kê**
  - **Nhật ký hệ thống** (admin)
  - **Ghi nhận thanh toán nội bộ** (tiền mặt / chuyển khoản, khác PayOS)

→ **Tổng cộng 11 sơ đồ** (Hình 2.1 … 2.11 gợi ý). Có thể gộp bớt khi in (ví dụ bỏ 2.10 nếu khoa không yêu cầu audit).

**Đối chiếu chi tiết với mã nguồn:** [`DOI-CHIEU-CHUC-NANG.md`](DOI-CHIEU-CHUC-NANG.md)

---

## Danh sách sơ đồ

| File | Gợi ý chú thích hình | Nội dung chính |
|------|----------------------|----------------|
| [`01-tong-quan-van-hanh.puml`](01-tong-quan-van-hanh.puml) | **Hình 2.1** — Tổng quan vận hành | Cấu hình → hợp đồng → chỉ số → hóa đơn → thanh toán → báo cáo |
| [`02-hop-dong-khach-phong.puml`](02-hop-dong-khach-phong.puml) | **Hình 2.2** — Khách, hợp đồng, gán phòng | Hồ sơ khách, phòng, hợp đồng ACTIVE, tài khoản |
| [`03-chi-so-hoa-don-ky.puml`](03-chi-so-hoa-don-ky.puml) | **Hình 2.3** — Chỉ số & hóa đơn kỳ | Công tơ, sinh/đồng bộ hóa đơn |
| [`04-thanh-toan-payos.puml`](04-thanh-toan-payos.puml) | **Hình 2.4** — Thanh toán PayOS | Link/QR → webhook → cập nhật hóa đơn |
| [`05-xac-thuc-tai-khoan.puml`](05-xac-thuc-tai-khoan.puml) | **Hình 2.5** — Xác thực | Đăng ký, đăng nhập, quên MK |
| [`06-yeu-cau-ho-tro-thong-bao.puml`](06-yeu-cau-ho-tro-thong-bao.puml) | **Hình 2.6** — Hỗ trợ & thông báo | Ticket, gửi/nhận thông báo |
| [`07-quan-ly-nguoi-dung-admin.puml`](07-quan-ly-nguoi-dung-admin.puml) | **Hình 2.7** — Quản lý người dùng | Tạo/sửa/khóa, gắn khách |
| [`08-danh-muc-khu-phong-bang-gia.puml`](08-danh-muc-khu-phong-bang-gia.puml) | **Hình 2.8** — Danh mục khu, phòng, bảng giá | Thiết lập trước khi vận hành kỳ |
| [`09-bao-cao-thong-ke.puml`](09-bao-cao-thong-ke.puml) | **Hình 2.9** — Báo cáo, thống kê | Xem doanh thu, công nợ, tổng quan |
| [`10-nhat-ky-he-thong.puml`](10-nhat-ky-he-thong.puml) | **Hình 2.10** — Nhật ký hệ thống | Tra cứu thao tác (admin) |
| [`11-ghi-nhan-thanh-toan-noi-bo.puml`](11-ghi-nhan-thanh-toan-noi-bo.puml) | **Hình 2.11** — Thanh toán nội bộ | Tiền mặt / CK do BQL ghi nhận |

---

## Cách xuất ảnh

1. Cài [PlantUML](https://plantuml.com/) (hoặc extension VS Code).
2. Mở từng `.puml` → Export PNG hoặc SVG.
3. Trong Word: *Insert → Pictures*, chú thích *Hình 2.x. …*

Tài liệu tổng hợp: [`../2.1.2-SO-DO-NGHIEP-VU.md`](../2.1.2-SO-DO-NGHIEP-VU.md).  
**Bảng diễn giải từng hoạt động (không chỉ UML):** [`../bang-dien-giai-quy-trinh-nghiep-vu.md`](../bang-dien-giai-quy-trinh-nghiep-vu.md).
