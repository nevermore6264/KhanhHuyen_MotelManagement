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

    private String userId;
}
