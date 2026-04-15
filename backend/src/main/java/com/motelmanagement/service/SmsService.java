package com.motelmanagement.service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.motelmanagement.config.ThuocTinhSms;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/** Gửi SMS qua eSMS API dùng OkHttp. */
@Component
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final ThuocTinhSms thuocTinhSms;
    /** Bean JSON mặc định của Spring Boot. */
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
                && notBlank(thuocTinhSms.getApiKey())
                && notBlank(thuocTinhSms.getBasicPassword());
    }

    public String layLoiGanNhat() {
        return loiGanNhat;
    }

    private static boolean notBlank(String s) {
        return s != null && !s.trim().isEmpty();
    }

    /** Chuẩn hóa số cho eSMS: +84/84... -> 0... */
    static String chuanHoaSoChoEsms(String sdt) {
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

    public boolean gui(String sdt, String noiDung) {
        loiGanNhat = "";
        if (!isConfigured()) {
            log.debug("SMS not configured, skip send to {}", sdt);
            return true;
        }
        if (thuocTinhSms.getSmsType() == 2 && !notBlank(thuocTinhSms.getSender())) {
            loiGanNhat = "eSMS yêu cầu app.sms.sender (Brandname) khi SmsType=2.";
            return false;
        }
        String to = chuanHoaSoChoEsms(sdt);
        if (to.isEmpty()) {
            loiGanNhat = "Số điện thoại không hợp lệ sau khi chuẩn hóa.";
            log.warn("SMS invalid phone after normalize: {}", sdt);
            return false;
        }
        try {
            Map<String, Object> root = new LinkedHashMap<>();
            root.put("ApiKey", thuocTinhSms.getApiKey().trim());
            root.put("SecretKey", thuocTinhSms.getBasicPassword().trim());
            root.put("Phone", to);
            root.put("Content", noiDung);
            root.put("SmsType", thuocTinhSms.getSmsType());
            if (notBlank(thuocTinhSms.getSender())) {
                root.put("Brandname", thuocTinhSms.getSender().trim());
            }
            String json = objectMapper.writeValueAsString(root);
            log.info("eSMS outbound payload: {}", truncate(json, 1200));
            RequestBody body = RequestBody.create(
                    json.getBytes(StandardCharsets.UTF_8),
                    okhttp3.MediaType.parse("application/json; charset=utf-8"));
            Request request = new Request.Builder()
                    .url(thuocTinhSms.getApiUrl().trim())
                    .post(body)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Accept", "application/json")
                    .build();
            try (Response response = httpClient.newCall(request).execute()) {
                okhttp3.ResponseBody rawBody = response.body();
                String respBody = rawBody != null ? rawBody.string() : "";
                log.info("eSMS raw response (HTTP {}): {}", response.code(), truncate(respBody, 1200));
                if (!response.isSuccessful()) {
                    loiGanNhat = "HTTP " + response.code() + " từ eSMS.";
                    log.warn("SMS eSMS HTTP {}: {}", response.code(), truncate(respBody, 500));
                    return false;
                }
                try {
                    JsonNode node = objectMapper.readTree(respBody);
                    // eSMS thường trả CodeResult="100" là thành công.
                    String code = node.path("CodeResult").asText("");
                    if (code.isBlank()) {
                        code = node.path("code").asText("");
                    }
                    boolean ok = "100".equals(code) || "00".equals(code) || "success".equalsIgnoreCase(node.path("status").asText(""));
                    if (!ok) {
                        String message = node.path("ErrorMessage").asText("");
                        if (message.isBlank()) {
                            message = node.path("message").asText("");
                        }
                        loiGanNhat = "eSMS trả về code=" + code
                                + (!message.isBlank() ? (", message=" + message) : "");
                        return false;
                    }
                } catch (Exception ignored) {
                    // Nếu parse JSON lỗi nhưng HTTP 2xx, coi là tạm thành công.
                }
                log.info("SMS sent to {} (eSMS)", to);
                if (log.isDebugEnabled()) {
                    log.debug("eSMS response: {}", truncate(respBody, 800));
                }
                return true;
            }
        } catch (IOException e) {
            loiGanNhat = "Lỗi kết nối eSMS: " + e.getMessage();
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
