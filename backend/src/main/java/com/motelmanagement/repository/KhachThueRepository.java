package com.motelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.KhachThue;


public interface KhachThueRepository extends JpaRepository<KhachThue, String> {
    List<KhachThue> findByHoTenContainingIgnoreCase(String keyword);

    KhachThue findByNguoiDung_Id(String nguoiDungId);


    List<KhachThue> findByNguoiDungIsNull();

    @Query(
            "SELECT k FROM KhachThue k WHERE k.nguoiDung IS NOT NULL"
                    + " AND k.email IS NOT NULL"
                    + " AND LOWER(TRIM(k.email)) = LOWER(TRIM(:email))")
    Optional<KhachThue> findFirstByEmailIgnoreCaseTrimmedCoTaiKhoan(
            @Param("email") String email);
}
