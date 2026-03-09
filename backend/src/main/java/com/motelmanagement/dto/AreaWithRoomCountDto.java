package com.motelmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
/** DTO khu vực kèm số lượng phòng. */
@NoArgsConstructor
@AllArgsConstructor
public class AreaWithRoomCountDto {
    private Long id;
    private String ten;
    private String diaChi;
    private String moTa;
    private long soPhong;
    /** True khi không còn phòng nào đang có hợp đồng thuê (ACTIVE) — cho phép xóa khu. */
    private boolean coTheXoa;
}
