package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TenantCreateDto {
    private String fullName;
    private String phone;
    private String idNumber;
    private String address;
    private String email;
    /** Optional: link tenant to existing user (account). Send only id, no nested user object. */
    private Long userId;
}
