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
    private Long id;
    private String name;
    private String address;
    private String description;
    private long roomCount;
    /** True khi không còn phòng nào đang có hợp đồng thuê (ACTIVE) — cho phép xóa khu. */
    private boolean canDelete;
}
