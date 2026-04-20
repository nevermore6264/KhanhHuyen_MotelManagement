package com.motelmanagement.dto;

import com.motelmanagement.domain.KhachThue;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Khách thuê rút gọn (liệt kê trên hóa đơn). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KhachThueTomTatDto {
    private String id;
    private String hoTen;
    private String soDienThoai;
    private String email;

    public static KhachThueTomTatDto tu(KhachThue k) {
        if (k == null) {
            return null;
        }
        return new KhachThueTomTatDto(
                k.getId(),
                k.getHoTen(),
                k.getSoDienThoai(),
                k.getEmail());
    }
}
