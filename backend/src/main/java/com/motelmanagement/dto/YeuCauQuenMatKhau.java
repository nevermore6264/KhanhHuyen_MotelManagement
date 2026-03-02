package com.motelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/** DTO yêu cầu quên mật khẩu (username + URL gốc frontend). */
@Getter
@Setter
public class YeuCauQuenMatKhau {
    @NotBlank(message = "Tài khoản không được để trống")
    private String tenDangNhap;
    /** URL gốc frontend để tạo link đặt lại mật khẩu (VD: http://localhost:4002) */
    private String resetBaseUrl;
}
