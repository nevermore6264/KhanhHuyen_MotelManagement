package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.KhachThue;


public interface KhachThueRepository extends JpaRepository<KhachThue, String> {
    List<KhachThue> findByHoTenContainingIgnoreCase(String keyword);

    KhachThue findByNguoiDung_Id(String nguoiDungId);


    List<KhachThue> findByNguoiDungIsNull();
}
