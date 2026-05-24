package com.motelmanagement.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.PhieuDatLaiMatKhau;


public interface PhieuDatLaiMatKhauRepository extends JpaRepository<PhieuDatLaiMatKhau, String> {

    Optional<PhieuDatLaiMatKhau> findByMaToken(String maToken);

    @Query("SELECT p FROM PhieuDatLaiMatKhau p JOIN p.nguoiDung n "
            + "WHERE LOWER(TRIM(n.email)) = LOWER(TRIM(:email)) AND p.maToken = :otp")
    Optional<PhieuDatLaiMatKhau> findByEmailAndOtp(
            @Param("email") String email, @Param("otp") String otp);


    @Modifying
    @Query("DELETE FROM PhieuDatLaiMatKhau t WHERE t.nguoiDung.id = :userId")
    void xoaTheoMaNguoiDung(String userId);
}
