package com.motelmanagement.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

/** Gia hạn: nhận endDate (frontend) hoặc ngayKetThuc. */
@Getter
@Setter
public class HopDongGiaHanDto {
    @JsonProperty("endDate")
    private LocalDate endDate;

    @JsonProperty("ngayKetThuc")
    private LocalDate ngayKetThuc;

    public LocalDate layNgayKetThuc() {
        if (endDate != null) {
            return endDate;
        }
        return ngayKetThuc;
    }
}
