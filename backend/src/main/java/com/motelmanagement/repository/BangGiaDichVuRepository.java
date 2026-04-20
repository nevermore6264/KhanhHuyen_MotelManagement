package com.motelmanagement.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.BangGiaDichVu;

/** Repository đơn giá dịch vụ (điện, nước). */
public interface BangGiaDichVuRepository extends JpaRepository<BangGiaDichVu, String> {
    /** Dùng cho luồng nhập chỉ số hiện tại (giữ tương thích code cũ). */
    Optional<BangGiaDichVu> findFirstByHieuLucTuLessThanEqualOrderByHieuLucTuDesc(LocalDate date);

    /** Lấy bảng giá mới nhất, không ràng buộc theo ngày hiệu lực. */
    Optional<BangGiaDichVu> findFirstByOrderByHieuLucTuDesc();
}
