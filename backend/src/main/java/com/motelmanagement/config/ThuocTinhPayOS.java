package com.motelmanagement.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
/** Cau hinh PayOS (API key, webhook, return/cancel URL). */
@Component
@ConfigurationProperties(prefix = "app.payos")
public class ThuocTinhPayOS {
    private String clientId = "";
    private String apiKey = "";
    private String checksumKey = "";
    /** URL BE nhận webhook (POST). Phải là backend :8080, không dùng port Next.js. */
    private String webhookUrl = "";
    /** true: khi khởi động gọi API PayOS confirm-webhook để đăng ký webhookUrl. */
    private boolean autoConfirmWebhook = false;
    private String returnUrl = "http://localhost:4002/hoa-don-cua-toi?payment=success";
    private String cancelUrl = "http://localhost:4002/hoa-don-cua-toi?payment=cancel";
}
