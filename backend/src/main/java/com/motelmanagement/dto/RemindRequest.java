package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RemindRequest {
    /** "email" hoặc "sms" */
    private String channel;
}
