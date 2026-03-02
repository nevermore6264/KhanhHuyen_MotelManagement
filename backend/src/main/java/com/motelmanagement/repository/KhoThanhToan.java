package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.ThanhToan;

/** Kho truy cập giao dịch thanh toán. */
public interface KhoThanhToan extends JpaRepository<ThanhToan, Long> {
    List<ThanhToan> findByHoaDonId(Long invoiceId);

    List<ThanhToan> findByHoaDon_KhachThue_IdOrderByPaidAtDesc(Long tenantId, Pageable pageable);
}
