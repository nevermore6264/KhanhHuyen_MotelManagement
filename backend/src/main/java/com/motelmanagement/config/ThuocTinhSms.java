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
    /** Ví dụ Infobip: https://{base}.api.infobip.com/sms/3/messages */
    private String apiUrl = "";
    /** Infobip: API key (header Authorization: App ...), không gồm tiền tố "App ". */
    private String apiKey = "";
    /** Mã / tên gửi đã đăng ký trên Infobip (trường sender). */
    private String sender = "";
}
