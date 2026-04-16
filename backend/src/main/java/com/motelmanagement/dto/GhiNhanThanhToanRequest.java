package com.motelmanagement.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

/** Ghi nhận thanh toán thủ công (một phần hoặc đủ số còn lại). */
@Getter
@Setter
public class GhiNhanThanhToanRequest {
    private Long invoiceId;
    /** Số tiền lần này (VNĐ). */
    private BigDecimal amount;
    /** "CASH" hoặc "TRANSFER". */
    private String method;
}
