package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.TrangThaiHopDong;

/** Repository hợp đồng. */
public interface HopDongRepository extends JpaRepository<HopDong, Long> {
    List<HopDong> findByTrangThai(TrangThaiHopDong trangThai);

    List<HopDong> findByKhachThue_Id(Long tenantId);

    long countByPhong_KhuVuc_IdAndTrangThai(Long areaId, TrangThaiHopDong trangThai);
}
