package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiPhong;

/** Repository phòng. */
public interface PhongRepository extends JpaRepository<Phong, Long> {
    List<Phong> findByTrangThai(TrangThaiPhong trangThai);

    long countByKhuVuc_Id(Long areaId);
}
