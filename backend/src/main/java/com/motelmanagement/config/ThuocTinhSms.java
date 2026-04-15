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
    /** Ví dụ SpeedSMS: https://api.speedsms.vn/index.php/sms/send */
    private String apiUrl = "";
    /** SpeedSMS access token (dùng cho HTTP Basic auth username). */
    private String apiKey = "";
    /** Mật khẩu Basic auth; SpeedSMS khuyến nghị dùng "x". */
    private String basicPassword = "x";
    /** Loại tin nhắn SpeedSMS (2=CSKH, 3=brandname...). */
    private int smsType = 2;
    /** Tên brandname (bắt buộc nếu smsType yêu cầu). */
    private String sender = "";
}
