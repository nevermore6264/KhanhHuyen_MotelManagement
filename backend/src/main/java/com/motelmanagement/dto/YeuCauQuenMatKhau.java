package com.motelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class YeuCauQuenMatKhau {
    @NotBlank(message = "Tài khoản không được để trống")
    private String tenDangNhap;

    private String resetBaseUrl;
}
