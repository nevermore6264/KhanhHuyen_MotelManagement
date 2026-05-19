package com.motelmanagement.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class HopDongTaoDto {
    @JsonProperty("phongId")
    private String phongId;

    @JsonProperty("khachThueIds")
    private List<String> khachThueIds = new ArrayList<>();


    @JsonProperty("daiDienKhachThueId")
    private String daiDienKhachThueId;

    @JsonProperty("startDate")
    private LocalDate startDate;

    @JsonProperty("endDate")
    private LocalDate endDate;

    @JsonProperty("deposit")
    private BigDecimal deposit;

    @JsonProperty("rent")
    private BigDecimal rent;
}
