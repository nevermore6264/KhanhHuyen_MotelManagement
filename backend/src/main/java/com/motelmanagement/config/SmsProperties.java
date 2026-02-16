package com.motelmanagement.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.sms")
public class SmsProperties {
    private boolean enabled = false;
    private String apiUrl = "";
    private String apiKey = "";
}
