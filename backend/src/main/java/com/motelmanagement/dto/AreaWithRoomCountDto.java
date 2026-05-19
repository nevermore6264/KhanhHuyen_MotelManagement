package com.motelmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter

@NoArgsConstructor
@AllArgsConstructor
public class AreaWithRoomCountDto {
    private String id;
    private String ten;
    private String diaChi;
    private String moTa;
    private long soPhong;

    private boolean coTheXoa;
}
