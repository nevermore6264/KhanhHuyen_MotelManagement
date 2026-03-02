package com.motelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** DTO yêu cầu đặt lại mật khẩu (token từ link quên mật khẩu + mật khẩu mới). */
@Getter
@Setter
public class YeuCauDatLaiMatKhau {
    @NotBlank(message = "Token không hợp lệ")
    private String token;
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
    private String newPassword;
}
