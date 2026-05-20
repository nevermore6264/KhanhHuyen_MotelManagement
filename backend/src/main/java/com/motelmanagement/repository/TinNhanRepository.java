package com.motelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.TinNhan;

public interface TinNhanRepository extends JpaRepository<TinNhan, String> {

    @Query("SELECT t FROM TinNhan t JOIN FETCH t.nguoiGui LEFT JOIN FETCH t.nguoiNhan "
            + "LEFT JOIN FETCH t.phong "
            + "WHERE t.hoiThoai.id = :hid ORDER BY t.thoiGianGui ASC")
    List<TinNhan> findByHoiThoaiId(@Param("hid") String hoiThoaiId);

    @Query("SELECT t FROM TinNhan t JOIN FETCH t.nguoiGui LEFT JOIN FETCH t.nguoiNhan "
            + "LEFT JOIN FETCH t.phong "
            + "WHERE t.nguoiGui.id = :uid OR t.nguoiNhan.id = :uid "
            + "ORDER BY t.thoiGianGui ASC")
    List<TinNhan> findHoiThoaiCuaNguoiDung(@Param("uid") String nguoiDungId);

    @Query("SELECT t FROM TinNhan t JOIN FETCH t.nguoiGui LEFT JOIN FETCH t.nguoiNhan "
            + "LEFT JOIN FETCH t.phong ORDER BY t.thoiGianGui ASC")
    List<TinNhan> findTatCaChoNhanVien();

    @Query("SELECT t FROM TinNhan t WHERE t.hoiThoai.id = :hid ORDER BY t.thoiGianGui DESC")
    List<TinNhan> findTopByHoiThoai(@Param("hid") String hoiThoaiId);

    Optional<TinNhan> findFirstByHoiThoaiIdOrderByThoiGianGuiDesc(String hoiThoaiId);
}
