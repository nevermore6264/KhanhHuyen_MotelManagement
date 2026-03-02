package com.motelmanagement.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.repository.KhoNguoiDung;

import lombok.RequiredArgsConstructor;

/**
 * Dịch vụ lấy người dùng hiện tại từ SecurityContext (JWT).
 */
@Service
@RequiredArgsConstructor
public class NguoiDungHienTaiService {
    private final KhoNguoiDung khoNguoiDung;

    /**
     * Lấy thực thể NguoiDung đang đăng nhập, hoặc null nếu chưa đăng nhập.
     *
     * @return NguoiDung
     */
    public NguoiDung layNguoiDungHienTai() {
        Authentication xacThuc = SecurityContextHolder.getContext().getAuthentication();
        if (xacThuc == null || xacThuc.getName() == null) {
            return null;
        }
        return khoNguoiDung.findByTenDangNhap(xacThuc.getName()).orElse(null);
    }
}
