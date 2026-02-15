package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserTenantLinkDto {
    /** ID khách thuê để gắn với user này. Null = bỏ gắn. */
    private Long tenantId;
}
