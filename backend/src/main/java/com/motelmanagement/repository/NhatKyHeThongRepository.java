package com.motelmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.NhatKyHeThong;

/** Repository nhật ký hệ thống. */
public interface NhatKyHeThongRepository extends JpaRepository<NhatKyHeThong, Long> {
}
