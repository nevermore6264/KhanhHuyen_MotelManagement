# Quy ước tiếng Việt trong mã nguồn

Tài liệu này mô tả phần đã thay thế **comment** và **tên class/function** sang tiếng Việt, và cách mở rộng nếu cần.

---

## 1. Đã thực hiện

### Backend (Java)

- **Comment:** Toàn bộ class/method/inline comment trong backend đã được chuyển hoặc bổ sung sang tiếng Việt (Javadoc, mô tả logic).
- **Module xác thực (AUTH) – đã đổi tên class và method:**

| Cũ (tiếng Anh)                 | Mới (tiếng Việt)        |
| ------------------------------ | ----------------------- |
| `User`                         | `NguoiDung`             |
| `PasswordResetToken`           | `PhieuDatLaiMatKhau`    |
| `AuthRequest`                  | `YeuCauXacThuc`         |
| `AuthResponse`                 | `PhanHoiXacThuc`        |
| `RegisterRequest`              | `YeuCauDangKy`          |
| `ForgotPasswordRequest`        | `YeuCauQuenMatKhau`     |
| `ForgotPasswordResponse`       | `PhanHoiQuenMatKhau`    |
| `ResetPasswordRequest`         | `YeuCauDatLaiMatKhau`   |
| `PasswordResetTokenRepository` | `KhoPhieuDatLaiMatKhau` |
| `AuthService`                  | `DichVuXacThuc`         |
| `AuthController`               | `XacThucController`     |
| `login()`                      | `dangNhap()`            |
| `register()`                   | `dangKy()`              |
| `forgotPassword()`             | `quenMatKhau()`         |
| `resetPassword()`              | `datLaiMatKhau()`       |

- **Module người dùng (USER) – đã đổi tên class:**

| Cũ (tiếng Anh)      | Mới (tiếng Việt)               |
| ------------------- | ------------------------------ |
| `UserRepository`    | `KhoNguoiDung`                 |
| `UserController`    | `NguoiDungController`          |
| `UserCreateDto`     | `YeuCauTaoNguoiDung`           |
| `UserTenantLinkDto` | `DtoLienKetNguoiDungKhachThue` |

- **Package config → cauhinh (tieng Viet khong dau):**

| Cu                           | Moi                           |
| ---------------------------- | ----------------------------- |
| `com.motelmanagement.config` | `com.motelmanagement.cauhinh` |
| `DataInitializer`            | `KhoiTaoDuLieu`               |
| `MailProperties`             | `ThuocTinhMail`               |
| `PayOSProperties`            | `ThuocTinhPayOS`              |
| `SmsProperties`              | `ThuocTinhSms`                |
| `WebConfig`                  | `CauHinhWeb`                  |
| `WebSocketConfig`            | `CauHinhWebSocket`            |

- **Domain (entity + enum) → tieng Viet khong dau, giu @Table(name="..."):**

| Cu             | Moi                  |
| -------------- | -------------------- |
| Area           | KhuVuc               |
| Room           | Phong                |
| RoomStatus     | TrangThaiPhong       |
| Tenant         | KhachThue            |
| Contract       | HopDong              |
| ContractStatus | TrangThaiHopDong     |
| ServicePrice   | BangGiaDichVu        |
| MeterReading   | ChiSoDienNuoc        |
| Invoice        | HoaDon               |
| InvoiceStatus  | TrangThaiHoaDon      |
| Payment        | ThanhToan            |
| PaymentMethod  | PhuongThucThanhToan  |
| PayOSOrder     | DonHangPayOS         |
| SupportRequest | YeuCauHoTro          |
| SupportStatus  | TrangThaiYeuCauHoTro |
| Notification   | ThongBao             |
| SystemLog      | NhatKyHeThong        |
| Role           | VaiTro               |

- **Controller → [Tên miền]Controller (tieng Viet khong dau):**

| Cu                       | Moi                     |
| ------------------------ | ----------------------- |
| AreaController           | KhuVucController        |
| RoomController           | PhongController         |
| ContractController       | HopDongController       |
| InvoiceController        | HoaDonController        |
| TenantController         | KhachThueController     |
| PaymentController        | ThanhToanController     |
| MeterReadingController   | ChiSoDienNuocController |
| ServicePriceController   | BangGiaController       |
| SupportRequestController | YeuCauHoTroController   |
| NotificationController   | ThongBaoController      |
| ReportController         | BaoCaoController        |
| SystemLogController      | NhatKyController        |

- **Job:** InvoiceGenerationJob → **CongViecSinhHoaDon**. **Logging:** ApiLoggingFilter → **BoLocGhiNhatKyApi**.

- **Repository (Kho):** AreaRepository → **KhoKhuVuc**, RoomRepository → **KhoPhong**, ContractRepository → **KhoHopDong**, TenantRepository → **KhoKhachThue**, InvoiceRepository → **KhoHoaDon**, PaymentRepository → **KhoThanhToan**, MeterReadingRepository → **KhoChiSoDienNuoc**, ServicePriceRepository → **KhoBangGiaDichVu**, PayOSOrderRepository → **KhoDonHangPayOS**, SupportRequestRepository → **KhoYeuCauHoTro**, NotificationRepository → **KhoThongBao**, SystemLogRepository → **KhoNhatKyHeThong**.

- **Security:** JwtUtil → **TienIchJwt**, JwtFilter → **BoLocJwt**, SecurityConfig → **CauHinhBaoMat**.

- **Service:** CurrentUserService → **DichVuNguoiDungHienTai**, BillingService → **DichVuTinhTien**, InvoiceReminderService → **DichVuNhacNoHoaDon**, NotificationService → **DichVuThongBao**, PayOSService → **DichVuPayOS**, LogService → **DichVuNhatKy**, SmsSender → **BoGuiSms**, TenantFileService → **DichVuFileKhachThue**.

- **Ten bien va ham (controller, service, security, job, logging, cauhinh):** Da doi sang tieng Viet khong dau trong toan bo backend. Vi du bien: `user` → `nguoiDung`, `tenant` → `khachThue`, `room` → `phong`, `invoice` → `hoaDon`, `request` → `yeuCau`, `id` (param) → `ma`. Vi du ham: `list()` → `layDanhSach()`, `create()` → `tao()`, `update()` → `capNhat()`, `delete()` → `xoa()`, `getCurrentUser()` → `layNguoiDungHienTai()`. **Giu nguyen:** getter/setter cua entity va DTO (de JSON khong doi), ten phuong thuc repository Spring Data (`findByUsername`, `save`, ...).

- **Giữ nguyên:** Đường dẫn API (`/api/auth/login`, `/api/users`, ...), tên bảng DB (`users`, `password_reset_tokens`), tên trường JSON (`username`, `token`, `fullName`, ...) để frontend và hợp đồng API không đổi.

### Frontend (TypeScript/React)

- **Comment:** Đã thêm comment tiếng Việt cho:
  - Trang: `login/page.tsx`, `contracts/page.tsx`
  - Thư viện: `lib/api.ts`, `lib/auth.ts`
  - Component: `ProtectedPage`, `NavBar`, `SimpleTable`
- **Tên component/function:** Giữ tiếng Anh (ví dụ: `LoginPage`, `submit`, `getToken`) để tương thích Next.js, import và thư viện. Có thể đổi dần theo từng file nếu cần.

### CSS

- **Tên class:** Chưa đổi (ví dụ vẫn dùng `.login-page`, `.card`, `.btn`). Đổi toàn bộ sang tiếng Việt sẽ phải sửa đồng thời `globals.css` và mọi file TSX dùng class đó (rất nhiều chỗ). Nếu cần, có thể đổi từng nhóm class (ví dụ chỉ các class trang login).

---

## 2. Cách mở rộng

- **Backend – module khác:** Làm tương tự module AUTH: đổi tên class/method sang tiếng Việt, giữ `@Table(name = "...")`, `@RequestMapping`, `@PostMapping` và tên trường JSON. Cập nhật mọi chỗ tham chiếu (repository, service, controller).
- **Frontend – đổi tên component/hàm:** Đổi tên component (ví dụ `ContractsPage` → `TrangHopDong`) và hàm (ví dụ `submit` → `xuLyGui`) trong từng file, rồi cập nhật import và lời gọi. Đường dẫn API và `res.data.*` giữ nguyên.
- **CSS – đổi tên class:** Chọn một class (ví dụ `.login-page` → `.trang-dang-nhap`), tìm toàn bộ chỗ dùng trong TSX và trong `globals.css`, thay thế đồng loạt.

---

## 3. Lưu ý

- Sau khi đổi tên class Java, tên file phải trùng tên class (ví dụ `NguoiDung.java`, `XacThucController.java`).
- Không đổi tên trường trong DTO/entity nếu trường đó được serialize ra JSON cho frontend (hoặc dùng `@JsonProperty("tên cũ")` khi đổi).
- Next.js dùng tên thư mục/file cho route (ví dụ `login/page.tsx` → `/login`). Có thể giữ nguyên đường dẫn, chỉ đổi tên component bên trong file.
