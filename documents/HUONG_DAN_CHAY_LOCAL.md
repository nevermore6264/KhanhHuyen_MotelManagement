# Hướng dẫn chạy source Motel Management trên máy

## 1. Kiến trúc

| Thành phần    | Công nghệ              | Cổng mặc định                                           |
| ------------- | ---------------------- | ------------------------------------------------------- |
| Backend API   | Spring Boot 3, Java 17 | `http://localhost:8080` (API: `/api`, WebSocket: `/ws`) |
| Frontend      | Next.js 14             | `http://localhost:4002`                                 |
| Cơ sở dữ liệu | MySQL                  | `localhost:3306`, database `motel`                      |

## 2. Phần mềm cần cài

- **JDK 17**
- **Apache Maven**
- **Node.js** khuyến nghị **18.x trở lên**
- **MySQL Server** (8.x hoặc tương thích)

## 3. Cấu hình MySQL

Trong `backend/src/main/resources/application.properties` mặc định có:

- URL: `jdbc:mysql://localhost:3306/motel?createDatabaseIfNotExist=true&...`
- User: `root`
- Password: `12345678`

Sửa `spring.datasource.username` / `spring.datasource.password` cho đúng môi trường của bạn.

Ứng dụng dùng `spring.jpa.hibernate.ddl-auto=update`: lần chạy đầu, Hibernate sẽ tạo/cập nhật bảng theo entity. Không bắt buộc chạy script SQL thủ công để có schema.

## 4. Chạy backend (Spring Boot)

Mở project backend trong IDE (IntelliJ) và chạy class `com.motelmanagement.ChuongTrinh`.

**Tài khoản admin mặc định** (tạo tự động lần đầu nếu chưa có user `admin` — xem `KhoiTaoDuLieu.java`):

- Tên đăng nhập: `admin`
- Mật khẩu: `admin123`

## 5. Chạy frontend (Next.js)

cd frontend

npm install

npm run dev

Mở trình duyệt: `http://localhost:4002` — đăng nhập bằng tài khoản admin ở trên

## 6. Dữ liệu mẫu

File `documents/data.sql` chứa INSERT mẫu cho `khu_vuc`, `phong`, `khach_thue`.

- Chạy script **sau** khi backend đã khởi động ít nhất một lần (để các bảng đã được tạo).
- Thực thi trong MySQL va chọn đúng database `motel`.
