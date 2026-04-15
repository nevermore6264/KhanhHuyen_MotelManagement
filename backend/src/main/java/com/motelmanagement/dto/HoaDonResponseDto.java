package com.motelmanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.BeanUtils;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHoaDon;

import lombok.Getter;
import lombok.Setter;

/** Hóa đơn trả về client + danh sách khách theo hợp đồng (đại diện + thành viên). */
@Getter
@Setter
public class HoaDonResponseDto {
    private Long id;
    private Phong phong;
    private KhachThue khachThue;
    private int thang;
    private int nam;
    private BigDecimal tienPhong;
    private BigDecimal tienDien;
    private BigDecimal tienNuoc;
    private BigDecimal tongTien;
    private TrangThaiHoaDon trangThai;
    private LocalDateTime ngayTao;
    private LocalDateTime nhacNoEmailLanCuoi;
    private int soLanNhacNoEmail;
    private String noiDungEmailCuoi;
    private LocalDateTime nhacNoSmsLanCuoi;
    private int soLanNhacNoSms;
    private String noiDungSmsCuoi;
    private List<KhachThueTomTatDto> danhSachKhachThue;

    public static HoaDonResponseDto tu(HoaDon h, List<KhachThueTomTatDto> danhSachKhachThue) {
        HoaDonResponseDto d = new HoaDonResponseDto();
        BeanUtils.copyProperties(h, d);
        d.setDanhSachKhachThue(danhSachKhachThue);
        return d;
    }
}
