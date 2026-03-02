package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;

/** DTO gắn/bỏ gắn tài khoản với khách thuê (tenantId). */
@Getter
@Setter
public class DtoLienKetNguoiDungKhachThue {
    /** ID khách thuê để gắn với user này. Null = bỏ gắn. */
    private Long tenantId;
}
