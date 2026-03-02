package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.DonHangPayOS;

/** Kho truy cập đơn PayOS. */
public interface KhoDonHangPayOS extends JpaRepository<DonHangPayOS, Long> {
    Optional<DonHangPayOS> findByOrderCode(long orderCode);
}
