package com.motelmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** DTO phản hồi quên mật khẩu: thông báo và (tuỳ trường hợp) link đặt lại. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PhanHoiQuenMatKhau {
    private String message;
    /** Link đặt lại mật khẩu (khi không gửi được email thì trả link để người dùng copy) */
    private String resetLink;
}
