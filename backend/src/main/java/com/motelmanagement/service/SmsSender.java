package com.motelmanagement.service;

import com.motelmanagement.config.SmsProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Gửi SMS qua HTTP API (gateway bên ngoài).
 * Cấu hình app.sms.api-url (POST), app.sms.api-key (header Authorization).
 * Body mặc định: JSON { "phone": "...", "message": "..." }.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SmsSender {

    private final SmsProperties smsProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isConfigured() {
        return smsProperties.isEnabled() && smsProperties.getApiUrl() != null && !smsProperties.getApiUrl().isBlank();
    }

    public boolean send(String phone, String message) {
        if (!isConfigured()) {
            log.debug("SMS not configured, skip send to {}", phone);
            return true;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (smsProperties.getApiKey() != null && !smsProperties.getApiKey().isBlank()) {
                headers.setBearerAuth(smsProperties.getApiKey());
            }
            HttpEntity<Map<String, String>> request = new HttpEntity<>(
                    Map.of("phone", phone, "message", message),
                    headers
            );
            restTemplate.postForObject(smsProperties.getApiUrl(), request, String.class);
            log.info("SMS sent to {}", phone);
            return true;
        } catch (Exception e) {
            log.warn("SMS send failed to {}: {}", phone, e.getMessage());
            return false;
        }
    }
}
