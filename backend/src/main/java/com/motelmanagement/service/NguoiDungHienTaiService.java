package com.motelmanagement.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.repository.NguoiDungRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class NguoiDungHienTaiService {
    private final NguoiDungRepository nguoiDungRepository;


    public NguoiDung layNguoiDungHienTai() {
        Authentication xacThuc = SecurityContextHolder.getContext().getAuthentication();
        if (xacThuc == null || xacThuc.getName() == null) {
            return null;
        }
        return nguoiDungRepository.findByTenDangNhap(xacThuc.getName()).orElse(null);
    }
}
