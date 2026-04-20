package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.ThanhToan;

/** Repository giao dịch thanh toán. */
public interface ThanhToanRepository extends JpaRepository<ThanhToan, String> {
    List<ThanhToan> findByHoaDon_Id(String invoiceId);

    List<ThanhToan> findByHoaDon_KhachThue_IdOrderByThoiGianThanhToanDesc(String tenantId, Pageable pageable);
}
