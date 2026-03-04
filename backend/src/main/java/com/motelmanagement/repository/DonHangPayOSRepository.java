package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.DonHangPayOS;

/** Repository đơn PayOS. */
public interface DonHangPayOSRepository extends JpaRepository<DonHangPayOS, Long> {
    Optional<DonHangPayOS> findByMaDonHang(long maDonHang);
}
