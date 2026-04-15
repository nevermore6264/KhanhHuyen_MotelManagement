package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.domain.TrangThaiPhong;

/** Repository phòng. */
public interface PhongRepository extends JpaRepository<Phong, Long> {
    List<Phong> findByTrangThai(TrangThaiPhong trangThai);

    long countByKhuVuc_Id(Long areaId);

    /** Phòng đang có ít nhất một hợp đồng ở trạng thái chỉ định (vd: ACTIVE). */
    @EntityGraph(attributePaths = {"khuVuc"})
    @Query("SELECT DISTINCT p FROM HopDong h JOIN h.phong p WHERE h.trangThai = :tt")
    List<Phong> findDistinctByHopDong_TrangThai(@Param("tt") TrangThaiHopDong tt);
}
