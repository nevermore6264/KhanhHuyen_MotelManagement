package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.TrangThaiHopDong;

/** Kho truy cập hợp đồng. */
public interface KhoHopDong extends JpaRepository<HopDong, Long> {
    List<HopDong> findByStatus(TrangThaiHopDong status);

    List<HopDong> findByKhachThue_Id(Long tenantId);

    long countByPhong_KhuVuc_IdAndStatus(Long areaId, TrangThaiHopDong status);
}
