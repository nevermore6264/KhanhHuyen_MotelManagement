package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiPhong;

/** Kho truy cập phòng. */
public interface KhoPhong extends JpaRepository<Phong, Long> {
    List<Phong> findByStatus(TrangThaiPhong status);

    long countByKhuVuc_Id(Long areaId);
}
