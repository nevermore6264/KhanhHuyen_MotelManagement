package com.motelmanagement.dto;

import com.motelmanagement.domain.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserCreateDto {
    private String username;
    private String password;
    private String fullName;
    private String phone;
    private Role role;
    private boolean active = true;
    /** Khi role = TENANT: gắn tài khoản với khách thuê có sẵn (chọn tenant chưa có tài khoản). */
    private Long tenantId;
}
