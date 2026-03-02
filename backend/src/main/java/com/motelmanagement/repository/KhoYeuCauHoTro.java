package com.motelmanagement.repository;

import com.motelmanagement.domain.YeuCauHoTro;
import org.springframework.data.jpa.repository.JpaRepository;

/** Kho truy cập yêu cầu hỗ trợ. */
public interface KhoYeuCauHoTro extends JpaRepository<YeuCauHoTro, Long> {
}
