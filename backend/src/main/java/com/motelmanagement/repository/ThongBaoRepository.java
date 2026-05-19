package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.ThongBao;


public interface ThongBaoRepository extends JpaRepository<ThongBao, String> {

    List<ThongBao> findByNguoiDungOrderByThoiGianGuiDesc(NguoiDung nguoiDung);


    List<ThongBao> findAllByOrderByThoiGianGuiDesc();
}
