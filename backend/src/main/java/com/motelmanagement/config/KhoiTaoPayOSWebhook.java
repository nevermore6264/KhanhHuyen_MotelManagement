package com.motelmanagement.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.motelmanagement.service.PayOSService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** Nếu bật app.payos.auto-confirm-webhook, đăng ký URL webhook với PayOS khi start (tránh nhập sai URL trên dashboard). */
@Component
@RequiredArgsConstructor
@Slf4j
public class KhoiTaoPayOSWebhook implements ApplicationRunner {

    private final ThuocTinhPayOS thuocTinhPayOS;
    private final PayOSService payOSService;

    @Override
    public void run(ApplicationArguments args) {
        if (!thuocTinhPayOS.isAutoConfirmWebhook()) {
            return;
        }
        log.info("PayOS: đang gọi confirm-webhook...");
        payOSService.xacNhanWebhookVoiPayOS();
    }
}
