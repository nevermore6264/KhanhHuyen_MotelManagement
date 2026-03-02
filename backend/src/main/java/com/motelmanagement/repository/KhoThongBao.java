package com.motelmanagement.repository;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Kho truy cập thông báo. */
public interface KhoThongBao extends JpaRepository<ThongBao, Long> {
    /** Lấy danh sách thông báo theo người dùng. */
    List<ThongBao> findByUser(NguoiDung user);
}
