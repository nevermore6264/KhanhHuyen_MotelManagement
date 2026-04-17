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
    private String id;
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

    private List<HoaDonChiTietDongDto> chiTiet = List.of();

    /** Chỉ số công tơ cùng kỳ với hóa đơn (null nếu chưa có bản ghi chỉ số). */
    private Integer chiSoDienCu;
    private Integer chiSoDienMoi;
    private Integer chiSoNuocCu;
    private Integer chiSoNuocMoi;

    public static HoaDonResponseDto tu(
            HoaDon h,
            List<KhachThueTomTatDto> danhSachKhachThue,
            List<HoaDonChiTietDongDto> chiTiet) {
        HoaDonResponseDto d = new HoaDonResponseDto();
        BeanUtils.copyProperties(h, d);
        d.setDanhSachKhachThue(danhSachKhachThue);
        d.setChiTiet(chiTiet != null ? chiTiet : List.of());
        return d;
    }
}
