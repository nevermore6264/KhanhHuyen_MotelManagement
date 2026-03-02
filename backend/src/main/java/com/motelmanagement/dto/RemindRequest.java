package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;

/** DTO yêu cầu gửi nhắc nợ (hóa đơn, kênh email/SMS). */
@Getter
@Setter
public class RemindRequest {
    /** "email" hoặc "sms" */
    private String channel;
}
