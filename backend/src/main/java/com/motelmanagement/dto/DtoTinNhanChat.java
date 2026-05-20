package com.motelmanagement.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.motelmanagement.domain.LoaiTinNhan;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DtoTinNhanChat {
    private String id;
    private String hoiThoaiId;
    private LoaiTinNhan loai;
    private String noiDung;
    private String duongDanFile;
    private String tenFile;
    private Long kichThuocFile;
    private String loaiNoiDungFile;
    private boolean daDoc;
    private LocalDateTime thoiGianGui;
    private String nguoiGuiId;
    private String nguoiGuiTen;
    private String nguoiGuiVaiTro;
    private List<DtoPhanHoiTinNhan> phanHoi;
}
