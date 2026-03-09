package com.motelmanagement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/** DTO yêu cầu đăng nhập. Nhận JSON: username/password hoặc tenDangNhap/matKhau. */
@Getter
@Setter
public class YeuCauXacThuc {
    @NotBlank
    private String tenDangNhap;
    @NotBlank
    private String matKhau;
}
