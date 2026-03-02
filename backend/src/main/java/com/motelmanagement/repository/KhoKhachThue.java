package com.motelmanagement.repository;

import com.motelmanagement.domain.KhachThue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Kho truy cập khách thuê. */
public interface KhoKhachThue extends JpaRepository<KhachThue, Long> {
    List<KhachThue> findByFullNameContainingIgnoreCase(String keyword);

    KhachThue findByUser_Id(Long userId);

    /** Khách thuê chưa gắn tài khoản (để chọn khi tạo tài khoản TENANT). */
    List<KhachThue> findByUserIsNull();
}
