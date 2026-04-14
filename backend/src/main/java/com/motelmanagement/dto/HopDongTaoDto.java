package com.motelmanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;

/** Dữ liệu tạo hợp đồng: một phòng, nhiều khách, một người đại diện. */
@Getter
@Setter
public class HopDongTaoDto {
    @JsonProperty("phongId")
    private Long phongId;

    @JsonProperty("khachThueIds")
    private List<Long> khachThueIds = new ArrayList<>();

    /** Phải nằm trong khachThueIds. */
    @JsonProperty("daiDienKhachThueId")
    private Long daiDienKhachThueId;

    @JsonProperty("startDate")
    private LocalDate startDate;

    @JsonProperty("endDate")
    private LocalDate endDate;

    @JsonProperty("deposit")
    private BigDecimal deposit;

    @JsonProperty("rent")
    private BigDecimal rent;
}
