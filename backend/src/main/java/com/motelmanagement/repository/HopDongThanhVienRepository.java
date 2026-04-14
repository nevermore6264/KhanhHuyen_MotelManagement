package com.motelmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.HopDongThanhVien;

public interface HopDongThanhVienRepository extends JpaRepository<HopDongThanhVien, Long> {
    long countByHopDong_Id(Long hopDongId);
}
