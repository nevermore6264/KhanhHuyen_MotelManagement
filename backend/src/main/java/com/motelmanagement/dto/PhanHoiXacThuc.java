package com.motelmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** DTO phản hồi đăng nhập: token JWT, vaiTro, hoTen. */
@Getter
@AllArgsConstructor
public class PhanHoiXacThuc {
    private String token;
    private String vaiTro;
    private String hoTen;
}
