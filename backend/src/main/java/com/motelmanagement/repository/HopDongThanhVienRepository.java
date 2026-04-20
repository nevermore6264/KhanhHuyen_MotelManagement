package com.motelmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.HopDongThanhVien;

public interface HopDongThanhVienRepository extends JpaRepository<HopDongThanhVien, String> {
    long countByHopDong_Id(String hopDongId);
}
