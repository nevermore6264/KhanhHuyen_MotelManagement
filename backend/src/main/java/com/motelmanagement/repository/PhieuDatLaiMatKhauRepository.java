package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.motelmanagement.domain.PhieuDatLaiMatKhau;


public interface PhieuDatLaiMatKhauRepository extends JpaRepository<PhieuDatLaiMatKhau, String> {

    Optional<PhieuDatLaiMatKhau> findByMaToken(String maToken);


    @Modifying
    @Query("DELETE FROM PhieuDatLaiMatKhau t WHERE t.nguoiDung.id = :userId")
    void xoaTheoMaNguoiDung(String userId);
}
