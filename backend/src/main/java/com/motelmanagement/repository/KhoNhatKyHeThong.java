package com.motelmanagement.repository;

import com.motelmanagement.domain.NhatKyHeThong;
import org.springframework.data.jpa.repository.JpaRepository;

/** Kho truy cập nhật ký hệ thống. */
public interface KhoNhatKyHeThong extends JpaRepository<NhatKyHeThong, Long> {
}
