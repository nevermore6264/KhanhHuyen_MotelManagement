package com.motelmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordResponse {
    private String message;
    /** Link đặt lại mật khẩu (có khi không gửi email, trả về link cho user copy) */
    private String resetLink;
}
