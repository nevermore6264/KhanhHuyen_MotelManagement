package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.NguoiDung;

/** Kho truy cập người dùng (NguoiDung). */
public interface KhoNguoiDung extends JpaRepository<NguoiDung, Long> {
    /** Tìm theo tên đăng nhập. */
    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);
}
