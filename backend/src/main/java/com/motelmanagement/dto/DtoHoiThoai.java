package com.motelmanagement.dto;

import java.time.LocalDateTime;

import com.motelmanagement.domain.LoaiHoiThoai;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DtoHoiThoai {
    private String id;
    private LoaiHoiThoai loai;
    private String ten;
    private String tenHienThi;
    private String doiTuongId;
    private String doiTuongTen;
    private String doiTuongVaiTro;
    private String tinCuoi;
    private LocalDateTime thoiGianTinCuoi;
    private int soThanhVien;
}
