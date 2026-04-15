package com.motelmanagement.service;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
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
 * Gửi SMS qua SpeedSMS API (POST /sms/send) dùng OkHttp.
 * Cấu hình: app.sms.enabled, app.sms.api-url, app.sms.api-key, app.sms.basic-password,
 * app.sms.sms-type, app.sms.sender.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    private final ThuocTinhSms thuocTinhSms;
    /** Bean mặc định của Spring Boot (JSON Infobip). */
    private final ObjectMapper objectMapper;
    private volatile String loiGanNhat = "";
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();

    public boolean isConfigured() {
        return thuocTinhSms.isEnabled()
                && notBlank(thuocTinhSms.getApiUrl())
                && notBlank(thuocTinhSms.getApiKey());
    }

    public String layLoiGanNhat() {
        return loiGanNhat;
    }

    private static boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    /** Chuẩn hóa số cho SpeedSMS: +84/84xxxxxxxxx -> 0xxxxxxxxx (nội địa). */
    static String chuanHoaSoChoSpeedSms(String sdt) {
        if (sdt == null) {
            return "";
        }
        String d = sdt.replaceAll("[\\s\\-().]", "");
        if (d.startsWith("+")) {
            d = d.substring(1);
        }
        if (d.startsWith("84") && d.length() > 2) {
            return "0" + d.substring(2);
        }
        return d;
    }

    private String taoBasicAuth() {
        String username = thuocTinhSms.getApiKey().trim();
        String password = notBlank(thuocTinhSms.getBasicPassword()) ? thuocTinhSms.getBasicPassword().trim() : "x";
        String raw = username + ":" + password;
        return "Basic " + Base64.getEncoder().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    public boolean gui(String sdt, String noiDung) {
        loiGanNhat = "";
        if (!isConfigured()) {
            log.debug("SMS not configured, skip send to {}", sdt);
            return true;
        }
        String to = chuanHoaSoChoSpeedSms(sdt);
        if (to.isEmpty()) {
            loiGanNhat = "Số điện thoại không hợp lệ sau khi chuẩn hóa.";
            log.warn("SMS invalid phone after normalize: {}", sdt);
            return false;
        }
        try {
            Map<String, Object> root = new LinkedHashMap<>();
            root.put("to", List.of(to));
            root.put("content", noiDung);
            root.put("sms_type", thuocTinhSms.getSmsType());
            // sender chỉ bắt buộc với một số sms_type (vd brandname)
            if (notBlank(thuocTinhSms.getSender())) {
                root.put("sender", thuocTinhSms.getSender().trim());
            }
            String json = objectMapper.writeValueAsString(root);
            RequestBody body = RequestBody.create(json.getBytes(Charset.forName("UTF-8")), JSON);
            Request request = new Request.Builder()
                    .url(thuocTinhSms.getApiUrl().trim())
                    .post(body)
                    .addHeader("Authorization", taoBasicAuth())
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Accept", "application/json")
                    .build();
            try (Response response = httpClient.newCall(request).execute()) {
                okhttp3.ResponseBody rawBody = response.body();
                String respBody = rawBody != null ? rawBody.string() : "";
                if (!response.isSuccessful()) {
                    loiGanNhat = "HTTP " + response.code() + " từ SpeedSMS.";
                    log.warn("SMS SpeedSMS HTTP {}: {}", response.code(), truncate(respBody, 500));
                    return false;
                }
                boolean thanhCong = true;
                try {
                    JsonNode node = objectMapper.readTree(respBody);
                    String status = node.path("status").asText("");
                    String code = node.path("code").asText("");
                    if (!"success".equalsIgnoreCase(status) || !"00".equals(code)) {
                        thanhCong = false;
                        String message = node.path("message").asText("");
                        loiGanNhat = "SpeedSMS trả về code=" + code
                                + (message != null && !message.isBlank() ? (", message=" + message) : "");
                        log.warn("SMS SpeedSMS response not success: {}", truncate(respBody, 500));
                    }
                } catch (Exception ignored) {
                    // Không chặn flow nếu response không phải JSON chuẩn, coi HTTP 2xx là tạm thành công.
                }
                if (!thanhCong) {
                    return false;
                }
                log.info("SMS sent to {} (SpeedSMS)", to);
                if (log.isDebugEnabled()) {
                    log.debug("SpeedSMS response: {}", truncate(respBody, 800));
                }
                return true;
            }
        } catch (IOException e) {
            loiGanNhat = "Lỗi kết nối SpeedSMS: " + e.getMessage();
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
