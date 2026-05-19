package com.motelmanagement.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

@Component
@ConfigurationProperties(prefix = "app.sms")
public class ThuocTinhSms {
    private boolean enabled = false;

    private String apiUrl = "";

    private String apiKey = "";

    private String basicPassword = "";

    private int smsType = 2;

    private String sender = "";
}
