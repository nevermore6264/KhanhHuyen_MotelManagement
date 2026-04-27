-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: localhost    Database: motel
-- ------------------------------------------------------
-- Server version	5.7.44-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bang_gia_dich_vu`
--

DROP TABLE IF EXISTS `bang_gia_dich_vu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bang_gia_dich_vu` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `gia_dien` decimal(12,2) DEFAULT NULL,
  `gia_nuoc` decimal(12,2) DEFAULT NULL,
  `gia_phong` decimal(12,2) DEFAULT NULL,
  `hieu_luc_tu` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `chi_so_dien_nuoc`
--

DROP TABLE IF EXISTS `chi_so_dien_nuoc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chi_so_dien_nuoc` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `dien_moi` int(11) DEFAULT NULL,
  `nam` int(11) DEFAULT NULL,
  `ngay_tao` datetime(6) DEFAULT NULL,
  `nuoc_moi` int(11) DEFAULT NULL,
  `thang` int(11) DEFAULT NULL,
  `tien_dien` decimal(12,2) DEFAULT NULL,
  `tien_nuoc` decimal(12,2) DEFAULT NULL,
  `phong_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKr0r0cd0eabd14qmklymher8ki` (`phong_id`),
  CONSTRAINT `FKr0r0cd0eabd14qmklymher8ki` FOREIGN KEY (`phong_id`) REFERENCES `phong` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `don_hang_payos`
--

DROP TABLE IF EXISTS `don_hang_payos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `don_hang_payos` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `ma_don_hang` bigint(20) DEFAULT NULL,
  `hoa_don_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ngay_tao` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK3l8sje2mgfmyix1aufu4nqhg7` (`ma_don_hang`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hoa_don`
--

DROP TABLE IF EXISTS `hoa_don`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_don` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `nam` int(11) DEFAULT NULL,
  `ngay_tao` datetime(6) DEFAULT NULL,
  `thang` int(11) DEFAULT NULL,
  `trang_thai` enum('PAID','PARTIAL','UNPAID') COLLATE utf8_unicode_ci NOT NULL,
  `khach_thue_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phong_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKabbyj2m48l5v1l6a451gpf6po` (`khach_thue_id`),
  KEY `FK4pdctcv5ombgobtpyelkyfwl` (`phong_id`),
  CONSTRAINT `FK4pdctcv5ombgobtpyelkyfwl` FOREIGN KEY (`phong_id`) REFERENCES `phong` (`id`),
  CONSTRAINT `FKabbyj2m48l5v1l6a451gpf6po` FOREIGN KEY (`khach_thue_id`) REFERENCES `khach_thue` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hoa_don_chi_tiet`
--

DROP TABLE IF EXISTS `hoa_don_chi_tiet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hoa_don_chi_tiet` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `so_tien` decimal(12,2) NOT NULL,
  `ten_khoan` varchar(200) COLLATE utf8_unicode_ci NOT NULL,
  `thu_tu` int(11) NOT NULL,
  `hoa_don_id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_hoa_don_chi_tiet_hoa_don` (`hoa_don_id`),
  CONSTRAINT `fk_hoa_don_chi_tiet_hoa_don` FOREIGN KEY (`hoa_don_id`) REFERENCES `hoa_don` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hop_dong`
--

DROP TABLE IF EXISTS `hop_dong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hop_dong` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `ngay_bat_dau` date DEFAULT NULL,
  `ngay_ket_thuc` date DEFAULT NULL,
  `ngay_tao` datetime(6) DEFAULT NULL,
  `tien_coc` decimal(12,2) DEFAULT NULL,
  `tien_thue` decimal(12,2) DEFAULT NULL,
  `trang_thai` enum('ACTIVE','ENDED','TERMINATED') COLLATE utf8_unicode_ci NOT NULL,
  `khach_thue_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phong_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKtsjl8p84e6mkbaof0ybgqkkh` (`khach_thue_id`),
  KEY `FKri6v014nupcknv2ao8yy9m1l6` (`phong_id`),
  CONSTRAINT `FKri6v014nupcknv2ao8yy9m1l6` FOREIGN KEY (`phong_id`) REFERENCES `phong` (`id`),
  CONSTRAINT `FKtsjl8p84e6mkbaof0ybgqkkh` FOREIGN KEY (`khach_thue_id`) REFERENCES `khach_thue` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hop_dong_thanh_vien`
--

DROP TABLE IF EXISTS `hop_dong_thanh_vien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hop_dong_thanh_vien` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `la_dai_dien` bit(1) NOT NULL,
  `hop_dong_id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `khach_thue_id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKd2rvdxxdmke1cwmegr2pyrq9j` (`hop_dong_id`,`khach_thue_id`),
  KEY `FKqocgblt2fnoplkr99d4qyowc4` (`khach_thue_id`),
  CONSTRAINT `FKqocgblt2fnoplkr99d4qyowc4` FOREIGN KEY (`khach_thue_id`) REFERENCES `khach_thue` (`id`),
  CONSTRAINT `FKtvt3c0nbbi11fsttdj9qb6p5` FOREIGN KEY (`hop_dong_id`) REFERENCES `hop_dong` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `khach_thue`
--

DROP TABLE IF EXISTS `khach_thue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khach_thue` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `anh_chan_dung` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `anh_giay_to` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `dia_chi` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ho_ten` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `so_giay_to` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `nguoi_dung_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKl6yifjacsoihw0s2ln4rv6fc7` (`nguoi_dung_id`),
  CONSTRAINT `FKh9pby7q3qdn8orqm5xmtd96bp` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `khu_vuc`
--

DROP TABLE IF EXISTS `khu_vuc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `khu_vuc` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `dia_chi` varchar(200) COLLATE utf8_unicode_ci DEFAULT NULL,
  `mo_ta` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ten` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nguoi_dung`
--

DROP TABLE IF EXISTS `nguoi_dung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoi_dung` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ho_ten` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `kich_hoat` bit(1) NOT NULL,
  `mat_khau` varchar(120) COLLATE utf8_unicode_ci NOT NULL,
  `so_dien_thoai` varchar(20) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ten_dang_nhap` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `vai_tro` enum('ADMIN','STAFF','TENANT') COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKo0s268lrp9is6o1e4ek6m1lc6` (`ten_dang_nhap`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nhac_no_hoa_don_email`
--

DROP TABLE IF EXISTS `nhac_no_hoa_don_email`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhac_no_hoa_don_email` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `email_nguoi_nhan` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `gui_luc` datetime(6) NOT NULL,
  `noi_dung` varchar(2000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `hoa_don_id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_nhac_no_email_hoa_don` (`hoa_don_id`),
  CONSTRAINT `fk_nhac_no_email_hoa_don` FOREIGN KEY (`hoa_don_id`) REFERENCES `hoa_don` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nhat_ky_he_thong`
--

DROP TABLE IF EXISTS `nhat_ky_he_thong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhat_ky_he_thong` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `chi_tiet` varchar(1000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `hanh_dong` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `loai_thuc_the` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `ma_thuc_the` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ngay_tao` datetime(6) DEFAULT NULL,
  `nguoi_thuc_hien_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKij7d1jemsg6u18wjxnri282fs` (`nguoi_thuc_hien_id`),
  CONSTRAINT `FKij7d1jemsg6u18wjxnri282fs` FOREIGN KEY (`nguoi_thuc_hien_id`) REFERENCES `nguoi_dung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `phieu_dat_lai_mat_khau`
--

DROP TABLE IF EXISTS `phieu_dat_lai_mat_khau`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phieu_dat_lai_mat_khau` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `het_han_luc` datetime(6) NOT NULL,
  `ma_token` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `nguoi_dung_id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKoqe7ot49g1b8xmj0d314qv39s` (`ma_token`),
  KEY `IDXoqe7ot49g1b8xmj0d314qv39s` (`ma_token`),
  KEY `FK7fbhekwj61d3wybsxmxlkx1g0` (`nguoi_dung_id`),
  CONSTRAINT `FK7fbhekwj61d3wybsxmxlkx1g0` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `phong`
--

DROP TABLE IF EXISTS `phong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phong` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `dien_tich` decimal(8,2) DEFAULT NULL,
  `gia_hien_tai` decimal(12,2) DEFAULT NULL,
  `ma_phong` varchar(30) COLLATE utf8_unicode_ci NOT NULL,
  `tang` varchar(30) COLLATE utf8_unicode_ci DEFAULT NULL,
  `trang_thai` enum('AVAILABLE','MAINTENANCE','OCCUPIED') COLLATE utf8_unicode_ci NOT NULL,
  `khu_vuc_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKdbhv1agmswa991vn77j0on6ym` (`khu_vuc_id`),
  CONSTRAINT `FKdbhv1agmswa991vn77j0on6ym` FOREIGN KEY (`khu_vuc_id`) REFERENCES `khu_vuc` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `thanh_toan`
--

DROP TABLE IF EXISTS `thanh_toan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thanh_toan` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `phuong_thuc` enum('CASH','TRANSFER') COLLATE utf8_unicode_ci NOT NULL,
  `so_tien` decimal(12,2) DEFAULT NULL,
  `thoi_gian_thanh_toan` datetime(6) DEFAULT NULL,
  `hoa_don_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_thanh_toan_hoa_don` (`hoa_don_id`),
  CONSTRAINT `fk_thanh_toan_hoa_don` FOREIGN KEY (`hoa_don_id`) REFERENCES `hoa_don` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `thong_bao`
--

DROP TABLE IF EXISTS `thong_bao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `thong_bao` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `da_doc` bit(1) NOT NULL,
  `noi_dung` varchar(500) COLLATE utf8_unicode_ci NOT NULL,
  `thoi_gian_gui` datetime(6) DEFAULT NULL,
  `nguoi_dung_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2883elhrppa005tc6cla0sm6y` (`nguoi_dung_id`),
  CONSTRAINT `FK2883elhrppa005tc6cla0sm6y` FOREIGN KEY (`nguoi_dung_id`) REFERENCES `nguoi_dung` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `yeu_cau_ho_tro`
--

DROP TABLE IF EXISTS `yeu_cau_ho_tro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yeu_cau_ho_tro` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `mo_ta` varchar(2000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ngay_cap_nhat` datetime(6) DEFAULT NULL,
  `ngay_tao` datetime(6) DEFAULT NULL,
  `tieu_de` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `trang_thai` enum('CLOSED','IN_PROGRESS','OPEN','RESOLVED') COLLATE utf8_unicode_ci NOT NULL,
  `khach_thue_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  `phong_id` varchar(36) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKk2h5rgj3nnb1gd98qbhbjl94l` (`khach_thue_id`),
  KEY `FKbinfwlp3o56oqsunjg933qeni` (`phong_id`),
  CONSTRAINT `FKbinfwlp3o56oqsunjg933qeni` FOREIGN KEY (`phong_id`) REFERENCES `phong` (`id`),
  CONSTRAINT `FKk2h5rgj3nnb1gd98qbhbjl94l` FOREIGN KEY (`khach_thue_id`) REFERENCES `khach_thue` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-27  7:30:02
