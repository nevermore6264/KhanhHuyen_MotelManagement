package com.motelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.dto.KhachThueTimTheoEmailDto;


public interface KhachThueRepository extends JpaRepository<KhachThue, String> {
    List<KhachThue> findByHoTenContainingIgnoreCase(String keyword);

    KhachThue findByNguoiDung_Id(String nguoiDungId);


    List<KhachThue> findByNguoiDungIsNull();

    @Query(
            "SELECT new com.motelmanagement.dto.KhachThueTimTheoEmailDto("
                    + "k.nguoiDung.id, TRIM(k.email)) FROM KhachThue k"
                    + " WHERE k.nguoiDung IS NOT NULL"
                    + " AND k.email IS NOT NULL"
                    + " AND LOWER(TRIM(k.email)) = LOWER(TRIM(:email))")
    Optional<KhachThueTimTheoEmailDto> findFirstTaiKhoanByEmailIgnoreCaseTrimmed(
            @Param("email") String email);
}
