package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.NhacNoHoaDonEmail;

/** Lịch sử email nhắc nợ hóa đơn. */
public interface NhacNoHoaDonEmailRepository extends JpaRepository<NhacNoHoaDonEmail, String> {

    long countByHoaDon_Id(String hoaDonId);

    Optional<NhacNoHoaDonEmail> findTopByHoaDon_IdOrderByGuiLucDesc(String hoaDonId);
}
