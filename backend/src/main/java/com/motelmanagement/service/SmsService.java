package com.motelmanagement.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.motelmanagement.config.ThuocTinhSms;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Gửi SMS qua Infobip API (POST JSON /sms/3/messages) dùng OkHttp.
 * Cấu hình: app.sms.enabled, app.sms.api-url, app.sms.api-key, app.sms.sender.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    private final ThuocTinhSms thuocTinhSms;
    /** Bean mặc định của Spring Boot (JSON Infobip). */
    private final ObjectMapper objectMapper;
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();

    public boolean isConfigured() {
        return thuocTinhSms.isEnabled()
                && notBlank(thuocTinhSms.getApiUrl())
                && notBlank(thuocTinhSms.getApiKey())
                && notBlank(thuocTinhSms.getSender());
    }

    private static boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    /**
     * Số gửi Infobip (E.164 không dấu +): 09xxxxxxxx → 849xxxxxxxxx.
     */
    static String chuanHoaSoE164Vn(String sdt) {
        if (sdt == null) {
            return "";
        }
        String d = sdt.replaceAll("[\\s\\-().]", "");
        if (d.startsWith("+")) {
            d = d.substring(1);
        }
        if (d.startsWith("84")) {
            return d;
        }
        if (d.startsWith("0")) {
            return "84" + d.substring(1);
        }
        return d;
    }

    public boolean gui(String sdt, String noiDung) {
        if (!isConfigured()) {
            log.debug("SMS not configured, skip send to {}", sdt);
            return true;
        }
        String to = chuanHoaSoE164Vn(sdt);
        if (to.isEmpty()) {
            log.warn("SMS invalid phone after normalize: {}", sdt);
            return false;
        }
        String apiKey = thuocTinhSms.getApiKey().trim();
        if (apiKey.regionMatches(true, 0, "App ", 0, 4)) {
            apiKey = apiKey.substring(4).trim();
        }
        try {
            Map<String, Object> content = Map.of("text", noiDung);
            Map<String, Object> dest = Map.of("to", to);
            Map<String, Object> message = Map.of(
                    "destinations", List.of(dest),
                    "sender", thuocTinhSms.getSender().trim(),
                    "content", content);
            Map<String, Object> root = Map.of("messages", List.of(message));
            String json = objectMapper.writeValueAsString(root);
            RequestBody body = RequestBody.create(json.getBytes(StandardCharsets.UTF_8), JSON);
            Request request = new Request.Builder()
                    .url(thuocTinhSms.getApiUrl().trim())
                    .post(body)
                    .addHeader("Authorization", "App " + apiKey)
                    .addHeader("Accept", "application/json")
                    .build();
            try (Response response = httpClient.newCall(request).execute()) {
                String respBody = response.body() != null ? response.body().string() : "";
                if (!response.isSuccessful()) {
                    log.warn("SMS Infobip HTTP {}: {}", response.code(), truncate(respBody, 500));
                    return false;
                }
                log.info("SMS sent to {} (Infobip)", to);
                if (log.isDebugEnabled()) {
                    log.debug("Infobip response: {}", truncate(respBody, 800));
                }
                return true;
            }
        } catch (IOException e) {
            log.warn("SMS send failed to {}: {}", sdt, e.getMessage());
            return false;
        }
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return "";
        }
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
