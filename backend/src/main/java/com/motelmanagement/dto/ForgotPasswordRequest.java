package com.motelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {
    @NotBlank(message = "Tài khoản không được để trống")
    private String username;
    /** Base URL frontend để tạo link reset (VD: http://localhost:4002) */
    private String resetBaseUrl;
}
