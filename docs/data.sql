INSERT INTO khu_vuc (ten, dia_chi, mo_ta) VALUES
('Khu An Phát', '120 Lê Duẩn, Hải Châu', 'Khu trung tâm gần chợ Cồn'),
('Khu Sinh Viên BK', '35 Tôn Đức Thắng, Liên Chiểu', 'Gần Đại học Bách Khoa'),
('Khu Hòa Khánh A', '210 Âu Cơ, Liên Chiểu', 'Khu sinh viên đông'),
('Khu Green Home', '45 Phạm Văn Nghị, Thanh Khê', 'Gần Đại học Duy Tân'),
('Khu Phước Mỹ', '78 Võ Văn Kiệt, Sơn Trà', 'Gần biển Mỹ Khê'),
('Khu Minh Tâm', '12 Nguyễn Tri Phương, Hải Châu', 'Khu nhà trọ gia đình'),
('Khu Sunrise', '25 Nguyễn Văn Linh, Hải Châu', 'Khu phòng cao cấp'),
('Khu Hòa Minh', '150 Nguyễn Sinh Sắc, Liên Chiểu', 'Gần khu công nghiệp'),
('Khu Thanh Bình', '88 Trần Cao Vân, Thanh Khê', 'Gần trung tâm thành phố'),
('Khu Lotus', '66 Nguyễn Hữu Thọ, Hải Châu', 'Gần sân bay Đà Nẵng'),
('Khu Đông Giang', '102 Lê Thanh Nghị, Hải Châu', 'Gần Đại học Đông Á'),
('Khu Hòa An', '140 Tôn Đản, Cẩm Lệ', 'Khu nhà trọ sinh viên'),
('Khu Riverside', '15 Bạch Đằng, Hải Châu', 'View sông Hàn'),
('Khu Mỹ An', '200 Ngũ Hành Sơn, Ngũ Hành Sơn', 'Gần Đại học Kinh Tế'),
('Khu An Hải', '98 Ngô Quyền, Sơn Trà', 'Khu nhà trọ gần cầu sông Hàn'),
('Khu Hòa Xuân', '55 Phan Đăng Lưu, Cẩm Lệ', 'Khu mới phát triển'),
('Khu Sky Home', '77 Hàm Nghi, Thanh Khê', 'Khu mini apartment'),
('Khu Minh Châu', '35 Lý Tự Trọng, Hải Châu', 'Gần trung tâm hành chính'),
('Khu Ocean View', '120 Hồ Nghinh, Sơn Trà', 'Gần biển'),
('Khu Student House', '50 Trần Đại Nghĩa, Ngũ Hành Sơn', 'Gần Làng Đại học');

INSERT INTO phong (dien_tich, gia_hien_tai, ma_phong, tang, trang_thai, khu_vuc_id) VALUES
(18.5, 2200000, 'A101', '1', 'AVAILABLE', 1),
(20.0, 2500000, 'A102', '1', 'OCCUPIED', 1),
(22.0, 2600000, 'A201', '2', 'OCCUPIED', 1),

(16.0, 2000000, 'B101', '1', 'AVAILABLE', 2),
(18.0, 2100000, 'B102', '1', 'OCCUPIED', 2),
(20.0, 2300000, 'B201', '2', 'AVAILABLE', 2),

(15.5, 1800000, 'C101', '1', 'OCCUPIED', 3),
(17.0, 1900000, 'C102', '1', 'OCCUPIED', 3),
(19.0, 2000000, 'C201', '2', 'AVAILABLE', 3),

(18.0, 2400000, 'D101', '1', 'AVAILABLE', 4),
(20.0, 2600000, 'D102', '1', 'MAINTENANCE', 4),
(21.5, 2700000, 'D201', '2', 'OCCUPIED', 4),

(22.0, 3200000, 'E101', '1', 'OCCUPIED', 5),
(24.0, 3400000, 'E102', '1', 'AVAILABLE', 5),
(25.0, 3600000, 'E201', '2', 'AVAILABLE', 5),

(20.0, 2500000, 'F101', '1', 'OCCUPIED', 6),
(21.0, 2600000, 'F102', '1', 'AVAILABLE', 6),
(22.0, 2700000, 'F201', '2', 'AVAILABLE', 6),

(23.0, 3500000, 'G101', '1', 'OCCUPIED', 7),
(24.0, 3600000, 'G102', '1', 'OCCUPIED', 7),
(26.0, 3800000, 'G201', '2', 'AVAILABLE', 7),

(18.0, 2200000, 'H101', '1', 'AVAILABLE', 8),
(19.5, 2300000, 'H102', '1', 'OCCUPIED', 8),
(21.0, 2400000, 'H201', '2', 'AVAILABLE', 8),

(17.0, 2100000, 'I101', '1', 'OCCUPIED', 9),
(18.5, 2200000, 'I102', '1', 'AVAILABLE', 9),
(20.0, 2300000, 'I201', '2', 'AVAILABLE', 9),

(25.0, 3700000, 'J101', '1', 'OCCUPIED', 10),
(26.0, 3800000, 'J102', '1', 'AVAILABLE', 10),
(28.0, 4000000, 'J201', '2', 'AVAILABLE', 10);