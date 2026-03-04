package com.motelmanagement.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.BangGiaDichVu;

/** Repository đơn giá dịch vụ (điện, nước). */
public interface BangGiaDichVuRepository extends JpaRepository<BangGiaDichVu, Long> {
    Optional<BangGiaDichVu> findFirstByHieuLucTuLessThanEqualOrderByHieuLucTuDesc(LocalDate date);
}
