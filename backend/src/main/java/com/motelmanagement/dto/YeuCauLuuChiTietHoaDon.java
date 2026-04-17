package com.motelmanagement.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class YeuCauLuuChiTietHoaDon {
    private List<Dong> dong = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Dong {
        private String tenKhoan;
        private BigDecimal soTien;
    }
}
