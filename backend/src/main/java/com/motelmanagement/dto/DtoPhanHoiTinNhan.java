package com.motelmanagement.dto;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DtoPhanHoiTinNhan {
    private String emoji;
    private int soLuong;
    private List<String> nguoiDungIds;
    private boolean cuaToi;
}
