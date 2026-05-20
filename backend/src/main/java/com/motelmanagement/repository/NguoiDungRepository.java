package com.motelmanagement.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.VaiTro;


public interface NguoiDungRepository extends JpaRepository<NguoiDung, String> {

    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);

    List<NguoiDung> findByVaiTroIn(Collection<VaiTro> vaiTro);

    List<NguoiDung> findByKichHoatTrueAndIdNot(String id);

    @Query("SELECT n FROM NguoiDung n WHERE n.kichHoat = true AND n.id <> :exclude "
            + "AND (LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :q, '%')) "
            + "OR LOWER(n.tenDangNhap) LIKE LOWER(CONCAT('%', :q, '%'))) "
            + "ORDER BY n.hoTen ASC")
    List<NguoiDung> timChoChat(@Param("q") String q, @Param("exclude") String exclude);
}
