package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.ChiSoDienNuoc;
import com.motelmanagement.domain.Phong;

/** Repository chỉ số điện/nước. */
public interface ChiSoDienNuocRepository extends JpaRepository<ChiSoDienNuoc, Long> {
    Optional<ChiSoDienNuoc> findByPhongAndThangAndNam(Phong phong, int thang, int nam);

    Optional<ChiSoDienNuoc> findByPhong_IdAndThangAndNam(Long phongId, int thang, int nam);
}
