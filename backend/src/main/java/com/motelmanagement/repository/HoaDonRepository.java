package com.motelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.TrangThaiHoaDon;

/** Repository hóa đơn. */
public interface HoaDonRepository extends JpaRepository<HoaDon, String> {
    @EntityGraph(attributePaths = {"phong", "khachThue", "phong.khuVuc"})
    @Query("SELECT h FROM HoaDon h WHERE h.id = :id")
    Optional<HoaDon> timTheoIdCoPhong(@Param("id") String id);

    Optional<HoaDon> findByPhong_IdAndThangAndNam(Long roomId, int thang, int nam);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "khachThue", "phong" })
    @Query("select i from HoaDon i")
    List<HoaDon> findAllWithTenantAndRoom();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "khachThue", "phong", "phong.khuVuc" })
    List<HoaDon> findByKhachThue(KhachThue tenant);

    List<HoaDon> findByTrangThai(TrangThaiHoaDon trangThai);

    List<HoaDon> findByThangAndNam(int thang, int nam);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "phong", "khachThue", "phong.khuVuc" })
    @Query("SELECT i FROM HoaDon i WHERE i.trangThai = ?1")
    List<HoaDon> findByTrangThaiWithRoomAndTenant(TrangThaiHoaDon trangThai);

}
