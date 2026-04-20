package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.YeuCauHoTro;

/** Repository yêu cầu hỗ trợ. */
public interface YeuCauHoTroRepository extends JpaRepository<YeuCauHoTro, String> {
    List<YeuCauHoTro> findByKhachThue_IdOrderByNgayTaoDesc(String khachThueId);
}
