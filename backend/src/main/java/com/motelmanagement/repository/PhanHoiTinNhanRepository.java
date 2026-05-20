package com.motelmanagement.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.motelmanagement.domain.PhanHoiTinNhan;

public interface PhanHoiTinNhanRepository extends JpaRepository<PhanHoiTinNhan, String> {

    Optional<PhanHoiTinNhan> findByTinNhanIdAndNguoiDungIdAndEmoji(
            String tinNhanId, String nguoiDungId, String emoji);

    @Query("SELECT p FROM PhanHoiTinNhan p JOIN FETCH p.nguoiDung WHERE p.tinNhan.id IN :ids")
    List<PhanHoiTinNhan> findByTinNhanIdIn(@Param("ids") List<String> tinNhanIds);

    void deleteByTinNhanIdAndNguoiDungIdAndEmoji(String tinNhanId, String nguoiDungId, String emoji);
}
