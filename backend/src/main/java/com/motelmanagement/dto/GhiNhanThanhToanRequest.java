package com.motelmanagement.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class GhiNhanThanhToanRequest {
    private String invoiceId;

    private BigDecimal amount;

    private String method;
}
