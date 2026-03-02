# ĐỀ CƯƠNG VÀ NHIỆM VỤ ĐỒ ÁN

## HỆ THỐNG QUẢN LÝ NHÀ TRỌ (iTro)

---

# PHẦN 1. ĐỀ CƯƠNG ĐỒ ÁN

## 1. Thông tin chung

- **Tên đề tài:** Hệ thống quản lý nhà trọ và thu tiền (iTro)
- **Công nghệ chính:** Backend Spring Boot 3, Frontend Next.js 14, MySQL, JWT, WebSocket
- **Mục tiêu:** Xây dựng phần mềm web hỗ trợ chủ nhà trọ và nhân viên quản lý phòng, hợp đồng, hóa đơn, thanh toán; khách thuê xem hợp đồng, hóa đơn và thanh toán online.

---

## 2. Cấu trúc đề cương báo cáo đồ án

### Chương 1. TỔNG QUAN ĐỀ TÀI

- 1.1. Đặt vấn đề và lý do chọn đề tài
- 1.2. Mục tiêu và phạm vi đồ án
- 1.3. Đối tượng sử dụng hệ thống (Admin, Staff, Tenant)
- 1.4. Các chức năng chính của hệ thống (tóm tắt theo từng vai trò)
- 1.5. Công nghệ và công cụ sử dụng

### Chương 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

- 2.1. Kiến trúc ứng dụng web (client – server, REST API)
- 2.2. Spring Boot và Spring Security (JWT, phân quyền)
- 2.3. Next.js và React (SSR, routing, state)
- 2.4. Cơ sở dữ liệu quan hệ và JPA/Hibernate
- 2.5. WebSocket và thông báo real-time
- 2.6. Tích hợp thanh toán online (PayOS) và gửi email/SMS (nhắc nợ)

### Chương 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

- 3.1. Phân tích nghiệp vụ (quản lý khu/phòng, hợp đồng, khách thuê, hóa đơn, thanh toán, hỗ trợ)
- 3.2. Use case và User Story (tham chiếu tài liệu User_Story.md)
- 3.3. Sơ đồ lớp (Class diagram) – tham chiếu docs/class-diagram-level-1.md
- 3.4. Thiết kế cơ sở dữ liệu (ERD, các bảng: users, areas, rooms, tenants, contracts, service_prices, meter_readings, invoices, payments, support_requests, notifications, system_logs, password_reset_tokens, payos_orders, …)
- 3.5. Thiết kế API (REST endpoints cho Auth, Areas, Rooms, Tenants, Contracts, ServicePrice, MeterReading, Invoice, Payment, User, SupportRequest, Report, Notification, SystemLog, Payment PayOS)
- 3.6. Luồng xử lý chính: đăng nhập, tạo hợp đồng, tạo hóa đơn, thanh toán, quên mật khẩu, nhắc nợ

### Chương 4. TRIỂN KHAI HỆ THỐNG

- 4.1. Môi trường phát triển và cấu hình (Java 17, Node.js 18+, MySQL, cấu hình application.properties và biến môi trường)
- 4.2. Cấu trúc mã nguồn Backend (package: domain, dto, repository, service, controller, config, security, job)
- 4.3. Cấu trúc mã nguồn Frontend (app router, components, lib api/auth)
- 4.4. Xác thực và phân quyền (JWT, Role ADMIN/STAFF/TENANT, bảo vệ route FE và API)
- 4.5. Các module chức năng đã triển khai (liệt kê từng module và công nghệ liên quan)
- 4.6. Tích hợp PayOS (tạo link thanh toán, webhook, cập nhật trạng thái hóa đơn)
- 4.7. Gửi thông báo (WebSocket), nhắc nợ qua email/SMS (cấu hình Mail/SMS)
- 4.8. Quên mật khẩu (token, email, link reset)

### Chương 5. KIỂM THỬ VÀ ĐÁNH GIÁ

- 5.1. Kịch bản kiểm thử chức năng (đăng nhập, CRUD phòng/hợp đồng/khách thuê, tạo hóa đơn, thanh toán, quên mật khẩu)
- 5.2. Kiểm thử theo từng vai trò (Admin, Staff, Tenant)
- 5.3. Đánh giá ưu điểm, hạn chế và hướng phát triển

### Chương 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

- 6.1. Kết luận
- 6.2. Hướng phát triển (ví dụ: app mobile, báo cáo nâng cao, tích hợp ngân hàng khác)

### Tài liệu tham khảo

### Phụ lục (screenshot giao diện, danh sách API, cấu hình mẫu)

---

## 3. Danh sách chức năng đã triển khai (đối chiếu source code)

| STT | Chức năng                 | Mô tả ngắn                               | Backend                                                                           | Frontend                                  |
| --- | ------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | Đăng nhập / Đăng xuất     | JWT, lưu token/role/fullName             | AuthController, AuthService, JwtUtil, JwtFilter                                   | /login, auth, ProtectedPage               |
| 2   | Quên mật khẩu             | Token 15 phút, gửi email hoặc trả link   | AuthController (forgot-password, reset-password), AuthService, PasswordResetToken | /forgot-password, /reset-password         |
| 3   | Quản lý khu vực           | CRUD khu nhà trọ, thống kê số phòng      | AreaController, AreaRepository                                                    | /areas                                    |
| 4   | Quản lý phòng             | CRUD phòng, gán khu, trạng thái phòng    | RoomController, RoomRepository                                                    | /rooms                                    |
| 5   | Quản lý khách thuê        | CRUD khách thuê, gán user, ảnh đại diện  | TenantController, TenantFileService                                               | /tenants                                  |
| 6   | Quản lý hợp đồng          | Tạo/sửa hợp đồng, gán phòng–khách        | ContractController, ContractRepository                                            | /contracts                                |
| 7   | Bảng giá dịch vụ          | Giá phòng, điện, nước theo thời gian     | ServicePriceController                                                            | /service-prices                           |
| 8   | Chỉ số điện nước          | Nhập chỉ số, tính tiền (BillingService)  | MeterReadingController, BillingService                                            | /meter-readings                           |
| 9   | Hóa đơn                   | Tạo/xem hóa đơn, trạng thái, nhắc nợ     | InvoiceController, InvoiceGenerationJob                                           | /invoices                                 |
| 10  | Thanh toán                | Ghi nhận thanh toán, PayOS online        | PaymentController, PayOSService                                                   | /payments, PayOS webhook                  |
| 11  | Thanh toán online (PayOS) | Tạo link thanh toán, webhook cập nhật    | PayOSService, PaymentController                                                   | /my-invoices (tenant)                     |
| 12  | Báo cáo                   | Doanh thu, thống kê phòng                | ReportController                                                                  | /reports                                  |
| 13  | Quản lý người dùng        | CRUD user, phân quyền, khóa/mở khóa      | UserController                                                                    | /users                                    |
| 14  | Yêu cầu hỗ trợ            | Tạo/xem/cập nhật trạng thái              | SupportRequestController                                                          | /support-requests, /support (tenant)      |
| 15  | Thông báo                 | Real-time WebSocket, danh sách thông báo | NotificationController, NotificationService, WebSocketConfig                      | /notifications, NotificationProvider      |
| 16  | Nhắc nợ (email/SMS)       | Gửi nhắc nợ hóa đơn qua email/SMS        | InvoiceReminderService, Mail, SmsSender                                           | (gọi API từ quản lý hóa đơn)              |
| 17  | Log hệ thống              | Ghi log thao tác (actor, action, entity) | LogService, ApiLoggingFilter, SystemLogController                                 | (nội bộ / API log)                        |
| 18  | Giao diện khách thuê      | Hợp đồng, hóa đơn, thanh toán của tôi    | ContractController, InvoiceController, PaymentController (filter tenant)          | /my-contracts, /my-invoices, /my-payments |
| 19  | Dashboard                 | Tổng quan số liệu, biểu đồ               | (API report/dashboard)                                                            | /dashboard                                |

---

# PHẦN 2. NHIỆM VỤ ĐỒ ÁN

## 2.1. Nhiệm vụ chung của nhóm

- Phân tích nghiệp vụ quản lý nhà trọ và thu tiền.
- Thiết kế hệ thống (use case, sơ đồ lớp, cơ sở dữ liệu, API).
- Xây dựng Backend (Spring Boot) và Frontend (Next.js) theo đúng chức năng đã liệt kê.
- Tích hợp xác thực JWT, phân quyền Admin / Staff / Tenant.
- Kiểm thử và viết báo cáo đồ án theo đề cương trên.

---

## 2.2. Nhiệm vụ chi tiết (gợi ý phân công)

Các em có thể tham khảo phân công theo module dưới đây (hoặc điều chỉnh cho phù hợp nhóm).

| STT | Nhiệm vụ                                 | Mô tả                                                                | Ghi chú                                                                                     |
| --- | ---------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 1   | **Phân tích & thiết kế**                 | Viết User Story, use case, thiết kế DB (ERD), thiết kế API           | Dùng User_Story.md, class-diagram, và source API thực tế                                    |
| 2   | **Backend – Hạ tầng**                    | Cấu hình Spring Boot, Security (JWT), CORS, cấu trúc package         | SecurityConfig, JwtUtil, JwtFilter, application.properties                                  |
| 3   | **Backend – Auth**                       | Đăng nhập, đăng ký, quên mật khẩu, reset mật khẩu                    | AuthController, AuthService, PasswordResetToken                                             |
| 4   | **Backend – Khu & Phòng**                | CRUD khu vực, CRUD phòng, liên kết phòng–khu                         | AreaController, RoomController, Area, Room                                                  |
| 5   | **Backend – Khách thuê & Hợp đồng**      | CRUD khách thuê, CRUD hợp đồng, gán user–tenant                      | TenantController, ContractController, Tenant, Contract                                      |
| 6   | **Backend – Giá & Chỉ số**               | Bảng giá dịch vụ, chỉ số điện nước, tính tiền (BillingService)       | ServicePriceController, MeterReadingController, BillingService                              |
| 7   | **Backend – Hóa đơn & Thanh toán**       | Tạo hóa đơn, ghi nhận thanh toán, job tạo hóa đơn                    | InvoiceController, PaymentController, InvoiceGenerationJob                                  |
| 8   | **Backend – PayOS**                      | Tích hợp PayOS: tạo link, webhook, cập nhật trạng thái               | PayOSService, PaymentController (PayOS endpoints)                                           |
| 9   | **Backend – User, Support, Report, Log** | Quản lý user, yêu cầu hỗ trợ, báo cáo, log hệ thống                  | UserController, SupportRequestController, ReportController, LogService, SystemLogController |
| 10  | **Backend – Thông báo & WebSocket**      | Gửi thông báo real-time, lưu notification                            | NotificationService, WebSocketConfig, NotificationController                                |
| 11  | **Backend – Nhắc nợ**                    | Gửi nhắc nợ qua email/SMS (cấu hình Mail/SMS)                        | InvoiceReminderService, MailProperties, SmsSender                                           |
| 12  | **Frontend – Auth & Layout**             | Trang đăng nhập, quên mật khẩu, reset mật khẩu, layout, bảo vệ route | login, forgot-password, reset-password, AppShell, ProtectedPage, auth                       |
| 13  | **Frontend – Quản lý Khu & Phòng**       | Giao diện areas, rooms                                               | /areas, /rooms                                                                              |
| 14  | **Frontend – Khách thuê & Hợp đồng**     | Giao diện tenants, contracts                                         | /tenants, /contracts                                                                        |
| 15  | **Frontend – Giá & Chỉ số điện nước**    | Giao diện service-prices, meter-readings                             | /service-prices, /meter-readings                                                            |
| 16  | **Frontend – Hóa đơn & Thanh toán**      | Giao diện invoices, payments, tích hợp PayOS (tenant)                | /invoices, /payments, /my-invoices (thanh toán online)                                      |
| 17  | **Frontend – Báo cáo & Dashboard**       | Dashboard, báo cáo, biểu đồ                                          | /dashboard, /reports                                                                        |
| 18  | **Frontend – User, Support, Thông báo**  | Giao diện users, support-requests, notifications (real-time)         | /users, /support-requests, /support, /notifications                                         |
| 19  | **Kiểm thử & Báo cáo**                   | Kiểm thử chức năng theo vai trò, viết báo cáo theo đề cương          | Chương 5, 6 và phụ lục                                                                      |

---

## 2.3. Sản phẩm cần nộp (gợi ý)

1. **Mã nguồn:** Repository Backend + Frontend (có README/hướng dẫn chạy – tham khảo docs/setup.md).
2. **Báo cáo đồ án:** File Word/PDF theo đúng đề cương tại Phần 1.
3. **Tài liệu bổ sung:** User Story (User_Story.md), sơ đồ lớp (class-diagram-level-1.md), hướng dẫn cài đặt (setup.md).
4. **Demo:** Video hoặc demo trực tiếp các chức năng chính theo từng vai trò.

---

## 2.4. Công nghệ sử dụng (tóm tắt từ source)

| Thành phần    | Công nghệ                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Backend       | Java 17, Spring Boot 3.x, Spring Security, JWT (jjwt), Spring Data JPA, Spring WebSocket, Spring Mail |
| Cơ sở dữ liệu | MySQL                                                                                                 |
| Frontend      | Next.js 14, React 18, TypeScript, Axios, PrimeReact, Chart.js, STOMP/SockJS (WebSocket)               |
| Bảo mật       | JWT Bearer, BCrypt, phân quyền theo Role (ADMIN, STAFF, TENANT)                                       |
| Tích hợp      | PayOS (thanh toán online), SMTP (email), SMS gateway (tùy cấu hình)                                   |

---

_Tài liệu này được lập dựa trên toàn bộ source code hiện có của dự án Hệ thống quản lý nhà trọ (iTro). Các em có thể bổ sung tên thành viên, bảng phân công cụ thể và điều chỉnh đề cương cho đúng quy định của trường._
