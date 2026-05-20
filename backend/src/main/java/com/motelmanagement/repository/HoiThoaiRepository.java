package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.HoiThoai;

public interface HoiThoaiRepository extends JpaRepository<HoiThoai, String> {
    Optional<HoiThoai> findByMaCoDinh(String maCoDinh);
}
