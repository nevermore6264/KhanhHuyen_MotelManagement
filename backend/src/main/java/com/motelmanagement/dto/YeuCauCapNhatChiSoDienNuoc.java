package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;

/** Body cập nhật chỉ số mới (số cũ lấy từ số mới tháng trước). */
@Getter
@Setter
public class YeuCauCapNhatChiSoDienNuoc {
    private int dienMoi;
    private int nuocMoi;
}
