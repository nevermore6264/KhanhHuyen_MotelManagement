package com.motelmanagement.dto;

import com.motelmanagement.domain.VaiTro;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class YeuCauDangKy {
    @NotBlank
    private String tenDangNhap;
    @NotBlank
    private String matKhau;
    @NotBlank
    private String hoTen;
    private String soDienThoai;
    @NotNull
    private VaiTro vaiTro;
}
