package com.motelmanagement.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.payos")
public class PayOSProperties {
    /** Client ID từ kênh thanh toán PayOS (my.payos.vn) */
    private String clientId = "";
    /** API Key */
    private String apiKey = "";
    /** Checksum Key (để ký request và verify webhook) */
    private String checksumKey = "";
    /** URL backend nhận webhook từ PayOS (phải truy cập được từ internet) */
    private String webhookUrl = "";
    /** URL frontend khi thanh toán thành công */
    private String returnUrl = "http://localhost:4002/my-invoices?payment=success";
    /** URL frontend khi hủy thanh toán */
    private String cancelUrl = "http://localhost:4002/my-invoices?payment=cancel";
}
