package com.motelmanagement.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
/** Cau hinh SMS (API URL, token, ...). */
@Component
@ConfigurationProperties(prefix = "app.sms")
public class ThuocTinhSms {
    private boolean enabled = false;
    /** Ví dụ eSMS: https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json */
    private String apiUrl = "";
    /** eSMS ApiKey. */
    private String apiKey = "";
    /** eSMS SecretKey. */
    private String basicPassword = "";
    /** eSMS SmsType (2=CSKH, 4=Brandname Notify...). */
    private int smsType = 2;
    /** Brandname (nếu tài khoản có). */
    private String sender = "";
}
