package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;

/** Body cập nhật 4 chỉ số công tơ (điện/nước cũ–mới). */
@Getter
@Setter
public class YeuCauCapNhatChiSoDienNuoc {
    private int dienCu;
    private int dienMoi;
    private int nuocCu;
    private int nuocMoi;
}
