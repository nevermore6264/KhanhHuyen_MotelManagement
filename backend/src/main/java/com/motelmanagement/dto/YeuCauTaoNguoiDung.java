package com.motelmanagement.dto;

import com.motelmanagement.domain.VaiTro;

import lombok.Getter;
import lombok.Setter;

/** DTO tạo người dùng (tenDangNhap, matKhau, vaiTro, maKhachThue tùy chọn). */
@Getter
@Setter
public class YeuCauTaoNguoiDung {
    private String tenDangNhap;
    private String matKhau;
    private String hoTen;
    private String soDienThoai;
    private VaiTro vaiTro;
    private boolean kichHoat = true;
    /** Khi vaiTro = TENANT: gắn tài khoản với khách thuê có sẵn (chọn khách thuê chưa có tài khoản). */
    private Long maKhachThue;
}
