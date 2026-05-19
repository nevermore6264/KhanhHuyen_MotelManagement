package com.motelmanagement.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

@Component
@ConfigurationProperties(prefix = "app.payos")
public class ThuocTinhPayOS {
    private String clientId = "";
    private String apiKey = "";
    private String checksumKey = "";

    private String webhookUrl = "";

    private boolean autoConfirmWebhook = false;
    private String returnUrl = "http://localhost:4002/hoa-don-cua-toi?payment=success";
    private String cancelUrl = "http://localhost:4002/hoa-don-cua-toi?payment=cancel";
}
