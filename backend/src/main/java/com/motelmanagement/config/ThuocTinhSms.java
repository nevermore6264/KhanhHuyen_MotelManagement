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
    /** Ví dụ: https://api.speedsms.vn/index.php/sms/send */
    private String apiUrl = "";
    /** SpeedSMS access token. */
    private String apiKey = "";
    /** Password Basic auth (SpeedSMS thường dùng "x"). */
    private String basicPassword = "x";
    /** sms_type theo SpeedSMS (2 = CSKH). */
    private int smsType = 2;
    /** Sender nếu dùng brandname (không bắt buộc với sms_type=2). */
    private String sender = "";
}
