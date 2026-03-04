package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.KhachThue;

/** Repository khách thuê. */
public interface KhachThueRepository extends JpaRepository<KhachThue, Long> {
    List<KhachThue> findByHoTenContainingIgnoreCase(String keyword);

    KhachThue findByNguoiDung_Id(Long nguoiDungId);

    /** Khách thuê chưa gắn tài khoản (để chọn khi tạo tài khoản TENANT). */
    List<KhachThue> findByNguoiDungIsNull();
}
