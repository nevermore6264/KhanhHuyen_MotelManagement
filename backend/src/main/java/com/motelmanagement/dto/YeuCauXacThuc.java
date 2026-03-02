package com.motelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/** DTO yêu cầu đăng nhập (username, password). */
@Getter
@Setter
public class YeuCauXacThuc {
    @NotBlank
    private String tenDangNhap;
    @NotBlank
    private String matKhau;
}
