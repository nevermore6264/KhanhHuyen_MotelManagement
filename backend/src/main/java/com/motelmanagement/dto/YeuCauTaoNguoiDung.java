package com.motelmanagement.dto;

import com.motelmanagement.domain.VaiTro;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class YeuCauTaoNguoiDung {
    private String tenDangNhap;
    private String matKhau;
    private String hoTen;
    private String soDienThoai;
    private VaiTro vaiTro;
    private boolean kichHoat = true;

    private String maKhachThue;
}
