package com.motelmanagement.repository;

import com.motelmanagement.domain.BangGiaDichVu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

/** Kho truy cập đơn giá dịch vụ (điện, nước). */
public interface KhoBangGiaDichVu extends JpaRepository<BangGiaDichVu, Long> {
    Optional<BangGiaDichVu> findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(LocalDate date);
}
