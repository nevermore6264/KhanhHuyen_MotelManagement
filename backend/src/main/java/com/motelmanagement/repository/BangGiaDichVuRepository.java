package com.motelmanagement.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.BangGiaDichVu;


public interface BangGiaDichVuRepository extends JpaRepository<BangGiaDichVu, String> {

    Optional<BangGiaDichVu> findFirstByHieuLucTuLessThanEqualOrderByHieuLucTuDesc(LocalDate date);


    Optional<BangGiaDichVu> findFirstByOrderByHieuLucTuDesc();
}
