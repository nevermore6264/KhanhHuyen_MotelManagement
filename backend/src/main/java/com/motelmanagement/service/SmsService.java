package com.motelmanagement.service;

import java.util.Map;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.motelmanagement.config.ThuocTinhSms;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Gửi SMS qua HTTP API (gateway bên ngoài).
 * Cấu hình app.sms.api-url (POST), app.sms.api-key (header Authorization).
 * Body mặc định: JSON { "phone": "...", "message": "..." }.
 */
@Component
/** Dịch vụ gửi SMS (nhắc nợ, v.v.). */
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final ThuocTinhSms thuocTinhSms;
    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isConfigured() {
        return thuocTinhSms.isEnabled() && thuocTinhSms.getApiUrl() != null && !thuocTinhSms.getApiUrl().isBlank();
    }

    public boolean gui(String sdt, String noiDung) {
        if (!isConfigured()) {
            log.debug("SMS not configured, skip send to {}", sdt);
            return true;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (thuocTinhSms.getApiKey() != null && !thuocTinhSms.getApiKey().isBlank()) {
                headers.setBearerAuth(thuocTinhSms.getApiKey());
            }
            HttpEntity<Map<String, String>> yeuCau = new HttpEntity<>(
                    Map.of("phone", sdt, "message", noiDung),
                    headers
            );
            restTemplate.postForObject(thuocTinhSms.getApiUrl(), yeuCau, String.class);
            log.info("SMS sent to {}", sdt);
            return true;
        } catch (Exception e) {
            log.warn("SMS send failed to {}: {}", sdt, e.getMessage());
            return false;
        }
    }
}
