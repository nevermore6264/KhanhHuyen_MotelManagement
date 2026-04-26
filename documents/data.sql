SET @kv01 = UUID();
SET @kv02 = UUID();
SET @kv03 = UUID();
SET @kv04 = UUID();
SET @kv05 = UUID();
SET @kv06 = UUID();
SET @kv07 = UUID();
SET @kv08 = UUID();
SET @kv09 = UUID();
SET @kv10 = UUID();
SET @kv11 = UUID();
SET @kv12 = UUID();
SET @kv13 = UUID();
SET @kv14 = UUID();
SET @kv15 = UUID();
SET @kv16 = UUID();
SET @kv17 = UUID();
SET @kv18 = UUID();
SET @kv19 = UUID();
SET @kv20 = UUID();

INSERT INTO khu_vuc (id, ten, dia_chi, mo_ta) VALUES
(@kv01, 'Khu An Phát', '120 Lê Duẩn, Hải Châu', 'Khu trung tâm gần chợ Cồn'),
(@kv02, 'Khu Sinh Viên BK', '35 Tôn Đức Thắng, Liên Chiểu', 'Gần Đại học Bách Khoa'),
(@kv03, 'Khu Hòa Khánh A', '210 Âu Cơ, Liên Chiểu', 'Khu sinh viên đông'),
(@kv04, 'Khu Green Home', '45 Phạm Văn Nghị, Thanh Khê', 'Gần Đại học Duy Tân'),
(@kv05, 'Khu Phước Mỹ', '78 Võ Văn Kiệt, Sơn Trà', 'Gần biển Mỹ Khê'),
(@kv06, 'Khu Minh Tâm', '12 Nguyễn Tri Phương, Hải Châu', 'Khu nhà trọ gia đình'),
(@kv07, 'Khu Sunrise', '25 Nguyễn Văn Linh, Hải Châu', 'Khu phòng cao cấp'),
(@kv08, 'Khu Hòa Minh', '150 Nguyễn Sinh Sắc, Liên Chiểu', 'Gần khu công nghiệp'),
(@kv09, 'Khu Thanh Bình', '88 Trần Cao Vân, Thanh Khê', 'Gần trung tâm thành phố'),
(@kv10, 'Khu Lotus', '66 Nguyễn Hữu Thọ, Hải Châu', 'Gần sân bay Đà Nẵng'),
(@kv11, 'Khu Đông Giang', '102 Lê Thanh Nghị, Hải Châu', 'Gần Đại học Đông Á'),
(@kv12, 'Khu Hòa An', '140 Tôn Đản, Cẩm Lệ', 'Khu nhà trọ sinh viên'),
(@kv13, 'Khu Riverside', '15 Bạch Đằng, Hải Châu', 'View sông Hàn'),
(@kv14, 'Khu Mỹ An', '200 Ngũ Hành Sơn, Ngũ Hành Sơn', 'Gần Đại học Kinh Tế'),
(@kv15, 'Khu An Hải', '98 Ngô Quyền, Sơn Trà', 'Khu nhà trọ gần cầu sông Hàn'),
(@kv16, 'Khu Hòa Xuân', '55 Phan Đăng Lưu, Cẩm Lệ', 'Khu mới phát triển'),
(@kv17, 'Khu Sky Home', '77 Hàm Nghi, Thanh Khê', 'Khu mini apartment'),
(@kv18, 'Khu Minh Châu', '35 Lý Tự Trọng, Hải Châu', 'Gần trung tâm hành chính'),
(@kv19, 'Khu Ocean View', '120 Hồ Nghinh, Sơn Trà', 'Gần biển'),
(@kv20, 'Khu Student House', '50 Trần Đại Nghĩa, Ngũ Hành Sơn', 'Gần Làng Đại học');

INSERT INTO phong (id, dien_tich, gia_hien_tai, ma_phong, tang, trang_thai, khu_vuc_id) VALUES
(UUID(), 18.5, 2200000, 'A101', '1', 'AVAILABLE', @kv01),
(UUID(), 20.0, 2500000, 'A102', '1', 'AVAILABLE', @kv01),
(UUID(), 22.0, 2600000, 'A201', '2', 'AVAILABLE', @kv01),

(UUID(), 16.0, 2000000, 'B101', '1', 'AVAILABLE', @kv02),
(UUID(), 18.0, 2100000, 'B102', '1', 'AVAILABLE', @kv02),
(UUID(), 20.0, 2300000, 'B201', '2', 'AVAILABLE', @kv02),

(UUID(), 15.5, 1800000, 'C101', '1', 'AVAILABLE', @kv03),
(UUID(), 17.0, 1900000, 'C102', '1', 'AVAILABLE', @kv03),
(UUID(), 19.0, 2000000, 'C201', '2', 'AVAILABLE', @kv03),

(UUID(), 18.0, 2400000, 'D101', '1', 'AVAILABLE', @kv04),
(UUID(), 20.0, 2600000, 'D102', '1', 'AVAILABLE', @kv04),
(UUID(), 21.5, 2700000, 'D201', '2', 'AVAILABLE', @kv04),

(UUID(), 22.0, 3200000, 'E101', '1', 'AVAILABLE', @kv05),
(UUID(), 24.0, 3400000, 'E102', '1', 'AVAILABLE', @kv05),
(UUID(), 25.0, 3600000, 'E201', '2', 'AVAILABLE', @kv05),

(UUID(), 20.0, 2500000, 'F101', '1', 'AVAILABLE', @kv06),
(UUID(), 21.0, 2600000, 'F102', '1', 'AVAILABLE', @kv06),
(UUID(), 22.0, 2700000, 'F201', '2', 'AVAILABLE', @kv06),

(UUID(), 23.0, 3500000, 'G101', '1', 'AVAILABLE', @kv07),
(UUID(), 24.0, 3600000, 'G102', '1', 'AVAILABLE', @kv07),
(UUID(), 26.0, 3800000, 'G201', '2', 'AVAILABLE', @kv07),

(UUID(), 18.0, 2200000, 'H101', '1', 'AVAILABLE', @kv08),
(UUID(), 19.5, 2300000, 'H102', '1', 'AVAILABLE', @kv08),
(UUID(), 21.0, 2400000, 'H201', '2', 'AVAILABLE', @kv08),

(UUID(), 17.0, 2100000, 'I101', '1', 'AVAILABLE', @kv09),
(UUID(), 18.5, 2200000, 'I102', '1', 'AVAILABLE', @kv09),
(UUID(), 20.0, 2300000, 'I201', '2', 'AVAILABLE', @kv09),

(UUID(), 25.0, 3700000, 'J101', '1', 'AVAILABLE', @kv10),
(UUID(), 26.0, 3800000, 'J102', '1', 'AVAILABLE', @kv10),
(UUID(), 28.0, 4000000, 'J201', '2', 'AVAILABLE', @kv10);

INSERT INTO khach_thue (id, ho_ten, so_dien_thoai, so_giay_to, email, dia_chi) VALUES
(UUID(), 'Nguyễn Văn An', '0912345678', '079123456789', 'an.nguyen01@gmail.com', 'Hải Châu, Đà Nẵng'),
(UUID(), 'Trần Thị Bích', '0987654321', '079987654321', 'bich.tran02@gmail.com', 'Thanh Khê, Đà Nẵng'),
(UUID(), 'Lê Minh Hoàng', '0901122334', '079456789123', 'hoang.le03@gmail.com', 'Ngũ Hành Sơn, Đà Nẵng'),
(UUID(), 'Phạm Thu Trang', '0933445566', '079321654987', 'trang.pham04@gmail.com', 'Liên Chiểu, Đà Nẵng'),
(UUID(), 'Hoàng Gia Huy', '0977889900', '079654123789', 'huy.hoang05@gmail.com', 'Sơn Trà, Đà Nẵng'),
(UUID(), 'Đỗ Thị Lan', '0922334455', '079789456123', 'lan.do06@gmail.com', 'Cẩm Lệ, Đà Nẵng'),
(UUID(), 'Vũ Quang Hưng', '0966554433', '079147258369', 'hung.vu07@gmail.com', 'Điện Bàn, Quảng Nam'),
(UUID(), 'Bùi Thị Mai', '0944221133', '079258369147', 'mai.bui08@gmail.com', 'Hội An, Quảng Nam'),
(UUID(), 'Đặng Quốc Bảo', '0399887766', '079369258147', 'bao.dang09@gmail.com', 'Tam Kỳ, Quảng Nam'),
(UUID(), 'Nguyễn Thảo Vy', '0355778899', '079951357246', 'vy.nguyen10@gmail.com', 'Duy Xuyên, Quảng Nam');