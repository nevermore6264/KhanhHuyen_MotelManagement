package com.motelmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;


@Getter
@AllArgsConstructor
public class PhanHoiXacThuc {
    private String token;
    private String vaiTro;
    private String hoTen;
    private String nguoiDungId;
}
