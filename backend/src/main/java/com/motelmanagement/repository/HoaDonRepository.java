package com.motelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.TrangThaiHoaDon;

/** Repository hóa đơn. */
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    Optional<HoaDon> findByPhong_IdAndThangAndNam(Long roomId, int thang, int nam);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "khachThue", "phong" })
    @Query("select i from HoaDon i")
    List<HoaDon> findAllWithTenantAndRoom();

    List<HoaDon> findByKhachThue(KhachThue tenant);

    List<HoaDon> findByTrangThai(TrangThaiHoaDon trangThai);

    List<HoaDon> findByThangAndNam(int thang, int nam);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "phong", "khachThue", "phong.khuVuc" })
    @Query("SELECT i FROM HoaDon i WHERE i.trangThai = ?1")
    List<HoaDon> findByTrangThaiWithRoomAndTenant(TrangThaiHoaDon trangThai);

    @Query("select sum(i.tongTien) from HoaDon i where i.trangThai = 'PAID' and i.thang = ?1 and i.nam = ?2")
    Double sumRevenueByThang(int thang, int nam);

    @Query("select i.thang, sum(i.tongTien) from HoaDon i where i.trangThai = 'PAID' and i.nam = ?1 group by i.thang order by i.thang")
    List<Object[]> sumRevenueByThangForNam(int nam);
}
