package com.motelmanagement.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.ThanhToan;


public interface ThanhToanRepository extends JpaRepository<ThanhToan, String> {
    List<ThanhToan> findByHoaDon_Id(String invoiceId);

    List<ThanhToan> findByHoaDon_KhachThue_IdOrderByThoiGianThanhToanDesc(String tenantId, Pageable pageable);

    @Query("SELECT t FROM ThanhToan t JOIN FETCH t.hoaDon h LEFT JOIN FETCH h.phong LEFT JOIN FETCH h.khachThue "
            + "WHERE t.thoiGianThanhToan >= :tu AND t.thoiGianThanhToan < :den "
            + "ORDER BY t.thoiGianThanhToan ASC")
    List<ThanhToan> findTrongKhoangThoiGian(
            @Param("tu") LocalDateTime tu,
            @Param("den") LocalDateTime den);
}
