package com.motelmanagement.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class HoaDonChiTietDongDto {
    private String id;
    private String tenKhoan;
    private BigDecimal soTien;
    private int thuTu;
}
