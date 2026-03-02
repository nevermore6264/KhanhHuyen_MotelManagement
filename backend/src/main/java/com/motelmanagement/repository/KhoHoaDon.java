package com.motelmanagement.repository;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.TrangThaiHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

/** Kho truy cập hóa đơn. */
public interface KhoHoaDon extends JpaRepository<HoaDon, Long> {
    Optional<HoaDon> findByPhong_IdAndMonthAndYear(Long roomId, int month, int year);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "khachThue", "phong" })
    @Query("select i from HoaDon i")
    List<HoaDon> findAllWithTenantAndRoom();

    List<HoaDon> findByKhachThue(KhachThue tenant);

    List<HoaDon> findByStatus(TrangThaiHoaDon status);

    List<HoaDon> findByMonthAndYear(int month, int year);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "phong", "khachThue", "phong.khuVuc" })
    @Query("SELECT i FROM HoaDon i WHERE i.status = ?1")
    List<HoaDon> findByStatusWithRoomAndTenant(TrangThaiHoaDon status);

    @Query("select sum(i.total) from HoaDon i where i.status = 'PAID' and i.month = ?1 and i.year = ?2")
    Double sumRevenueByMonth(int month, int year);

    @Query("select i.month, sum(i.total) from HoaDon i where i.status = 'PAID' and i.year = ?1 group by i.month order by i.month")
    List<Object[]> sumRevenueByMonthForYear(int year);
}
