package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.TrangThaiHopDong;

/** Repository hợp đồng. */
public interface HopDongRepository extends JpaRepository<HopDong, Long> {
    List<HopDong> findByTrangThai(TrangThaiHopDong trangThai);

    List<HopDong> findByKhachThue_Id(Long tenantId);

    long countByPhong_KhuVuc_IdAndTrangThai(Long areaId, TrangThaiHopDong trangThai);

    @Query(
            "SELECT DISTINCT h FROM HopDong h LEFT JOIN h.thanhVien tv "
                    + "WHERE h.khachThue.id = :kid OR tv.khachThue.id = :kid")
    List<HopDong> findThuocKhachThue(@Param("kid") Long kid);

    @Query(
            "SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM HopDong h LEFT JOIN h.thanhVien tv "
                    + "WHERE h.id = :hid AND (h.khachThue.id = :kid OR tv.khachThue.id = :kid)")
    boolean khachCoTrongHopDong(@Param("hid") Long hid, @Param("kid") Long kid);

    @Query(
            "SELECT COUNT(h) FROM HopDong h LEFT JOIN h.thanhVien tv "
                    + "WHERE h.trangThai = :tt AND (h.khachThue.id = :tid OR tv.khachThue.id = :tid)")
    long demHopDongActiveCoKhach(@Param("tid") Long tid, @Param("tt") TrangThaiHopDong tt);
}
