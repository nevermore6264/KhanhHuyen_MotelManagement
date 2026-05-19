package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.NguoiDung;


public interface NguoiDungRepository extends JpaRepository<NguoiDung, String> {

    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);
}
