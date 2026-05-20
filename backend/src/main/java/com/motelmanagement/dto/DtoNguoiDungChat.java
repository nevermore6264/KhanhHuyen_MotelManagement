package com.motelmanagement.dto;

import com.motelmanagement.domain.VaiTro;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DtoNguoiDungChat {
    private String id;
    private String hoTen;
    private String tenDangNhap;
    private VaiTro vaiTro;
}
