package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.DonHangPayOS;


public interface DonHangPayOSRepository extends JpaRepository<DonHangPayOS, String> {
    Optional<DonHangPayOS> findByMaDonHang(long maDonHang);
}
