package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;

/** DTO yêu cầu gửi nhắc nợ (hóa đơn qua email). */
@Getter
@Setter
public class RemindRequest {
    /** "email" */
    private String channel;
}
