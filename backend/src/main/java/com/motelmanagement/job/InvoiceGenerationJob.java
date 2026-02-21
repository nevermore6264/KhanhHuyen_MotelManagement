package com.motelmanagement.job;

import java.time.YearMonth;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.motelmanagement.service.BillingService;

import lombok.RequiredArgsConstructor;

/**
 * Job chạy tự động sinh hóa đơn theo tháng cho các phòng có hợp đồng ACTIVE.
 * Chạy lúc 01:00 mỗi ngày; sinh hóa đơn cho tháng trước và tháng hiện tại nếu còn thiếu.
 */
@Component
@RequiredArgsConstructor
public class InvoiceGenerationJob {
    private final BillingService billingService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void generateMonthlyInvoices() {
        YearMonth now = YearMonth.now();
        YearMonth previous = now.minusMonths(1);
        billingService.generateInvoicesForMonth(previous.getMonthValue(), previous.getYear());
        billingService.generateInvoicesForMonth(now.getMonthValue(), now.getYear());
    }
}
