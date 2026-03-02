package com.motelmanagement.repository;

import com.motelmanagement.domain.ChiSoDienNuoc;
import com.motelmanagement.domain.Phong;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/** Kho truy cập chỉ số điện/nước. */
public interface KhoChiSoDienNuoc extends JpaRepository<ChiSoDienNuoc, Long> {
    Optional<ChiSoDienNuoc> findByPhongAndMonthAndYear(Phong phong, int month, int year);
}
