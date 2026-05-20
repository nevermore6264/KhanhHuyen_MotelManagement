package com.motelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.LoaiHoiThoai;
import com.motelmanagement.domain.ThanhVienHoiThoai;

public interface ThanhVienHoiThoaiRepository extends JpaRepository<ThanhVienHoiThoai, String> {

    boolean existsByHoiThoaiIdAndNguoiDungId(String hoiThoaiId, String nguoiDungId);

    List<ThanhVienHoiThoai> findByNguoiDungId(String nguoiDungId);

    List<ThanhVienHoiThoai> findByHoiThoaiId(String hoiThoaiId);

    @Query("SELECT tv FROM ThanhVienHoiThoai tv JOIN FETCH tv.hoiThoai h JOIN FETCH tv.nguoiDung "
            + "WHERE tv.nguoiDung.id = :uid ORDER BY h.thoiGianTao DESC")
    List<ThanhVienHoiThoai> findHoiThoaiCuaNguoiDung(@Param("uid") String nguoiDungId);

    @Query("SELECT h.id FROM HoiThoai h WHERE h.loai = :loai AND "
            + "(SELECT COUNT(tv) FROM ThanhVienHoiThoai tv WHERE tv.hoiThoai.id = h.id) = 2 AND "
            + "EXISTS (SELECT 1 FROM ThanhVienHoiThoai t1 WHERE t1.hoiThoai.id = h.id AND t1.nguoiDung.id = :u1) AND "
            + "EXISTS (SELECT 1 FROM ThanhVienHoiThoai t2 WHERE t2.hoiThoai.id = h.id AND t2.nguoiDung.id = :u2)")
    Optional<String> timHoiThoaiRieng(@Param("loai") LoaiHoiThoai loai, @Param("u1") String u1, @Param("u2") String u2);
}
