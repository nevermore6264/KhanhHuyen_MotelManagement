package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.ThongBao;

/** Repository thông báo. */
public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {
    /** Lấy danh sách thông báo theo người dùng. */
    List<ThongBao> findByNguoiDung(NguoiDung nguoiDung);
}
