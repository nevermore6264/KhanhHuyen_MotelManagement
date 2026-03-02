package com.motelmanagement.repository;

import com.motelmanagement.domain.KhuVuc;
import org.springframework.data.jpa.repository.JpaRepository;

/** Kho truy cập khu vực. */
public interface KhoKhuVuc extends JpaRepository<KhuVuc, Long> {
}
