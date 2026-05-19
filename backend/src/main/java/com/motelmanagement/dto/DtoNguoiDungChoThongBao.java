package com.motelmanagement.dto;

import com.motelmanagement.domain.VaiTro;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
public class DtoNguoiDungChoThongBao {
    private String id;
    private String tenDangNhap;
    private String hoTen;
    private VaiTro vaiTro;

    private String phongHienThue;

    private String khuHienThue;
}
