package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.motelmanagement.domain.PhieuDatLaiMatKhau;

/** Repository phiếu đặt lại mật khẩu. */
public interface PhieuDatLaiMatKhauRepository extends JpaRepository<PhieuDatLaiMatKhau, Long> {
    /** Tìm phiếu theo token. */
    Optional<PhieuDatLaiMatKhau> findByMaToken(String maToken);

    /** Xóa mọi phiếu của một người dùng (trước khi tạo phiếu mới). */
    @Modifying
    @Query("DELETE FROM PhieuDatLaiMatKhau t WHERE t.nguoiDung.id = :userId")
    void xoaTheoMaNguoiDung(Long userId);
}
