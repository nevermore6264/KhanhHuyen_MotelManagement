package com.motelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.TrangThaiHopDong;

/** Repository hợp đồng. */
public interface HopDongRepository extends JpaRepository<HopDong, String> {
    @EntityGraph(attributePaths = {"khachThue", "thanhVien", "thanhVien.khachThue"})
    Optional<HopDong> findByPhong_IdAndTrangThai(String phongId, TrangThaiHopDong trangThai);

    List<HopDong> findByTrangThai(TrangThaiHopDong trangThai);

    List<HopDong> findByKhachThue_Id(String tenantId);

    long countByPhong_KhuVuc_IdAndTrangThai(String areaId, TrangThaiHopDong trangThai);

    @Query(
            "SELECT DISTINCT h FROM HopDong h LEFT JOIN h.thanhVien tv "
                    + "WHERE h.khachThue.id = :kid OR tv.khachThue.id = :kid")
    List<HopDong> findThuocKhachThue(@Param("kid") String kid);

    @EntityGraph(attributePaths = {"phong", "phong.khuVuc"})
    @Query(
            "SELECT DISTINCT h FROM HopDong h LEFT JOIN h.thanhVien tv "
                    + "WHERE h.khachThue.id = :kid OR tv.khachThue.id = :kid")
    List<HopDong> findThuocKhachThueCoPhong(@Param("kid") String kid);

    @Query(
            "SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM HopDong h LEFT JOIN h.thanhVien tv "
                    + "WHERE h.id = :hid AND (h.khachThue.id = :kid OR tv.khachThue.id = :kid)")
    boolean khachCoTrongHopDong(@Param("hid") String hid, @Param("kid") String kid);

    @Query(
            "SELECT COUNT(DISTINCT h.id) FROM HopDong h LEFT JOIN h.thanhVien tv "
                    + "WHERE h.trangThai = :tt AND (h.khachThue.id = :tid OR tv.khachThue.id = :tid)")
    long demHopDongActiveCoKhach(@Param("tid") String tid, @Param("tt") TrangThaiHopDong tt);
}
