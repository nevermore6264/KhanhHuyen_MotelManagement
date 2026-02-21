package com.motelmanagement.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.Tenant;
import com.motelmanagement.domain.User;
import com.motelmanagement.dto.RemindRequest;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.service.BillingService;
import com.motelmanagement.service.CurrentUserService;
import com.motelmanagement.service.InvoiceReminderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/invoices")
public class InvoiceController {
    private final InvoiceRepository invoiceRepository;
    private final TenantRepository tenantRepository;
    private final CurrentUserService currentUserService;
    private final InvoiceReminderService invoiceReminderService;
    private final BillingService billingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Invoice> list() {
        return invoiceRepository.findAllWithTenantAndRoom();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TENANT')")
    public List<Invoice> myInvoices() {
        User user = currentUserService.getCurrentUser();
        if (user == null) {
            return List.of();
        }
        Tenant tenant = tenantRepository.findByUserId(user.getId());
        if (tenant == null) {
            return List.of();
        }
        return invoiceRepository.findByTenant(tenant);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Invoice create(@RequestBody Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Invoice> updateStatus(@PathVariable("id") Long id, @RequestParam(value = "status") InvoiceStatus status) {
        return invoiceRepository.findById(id)
                .map(existing -> {
                    existing.setStatus(status);
                    return ResponseEntity.ok(invoiceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Chạy ngay job sinh hóa đơn cho tháng trước và tháng hiện tại (tránh đợi job định kỳ). */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Map<String, Object>> generateNow() {
        java.time.YearMonth now = java.time.YearMonth.now();
        java.time.YearMonth previous = now.minusMonths(1);
        int prevCount = billingService.generateInvoicesForMonth(previous.getMonthValue(), previous.getYear());
        int currCount = billingService.generateInvoicesForMonth(now.getMonthValue(), now.getYear());
        int total = prevCount + currCount;
        return ResponseEntity.ok(Map.of(
                "message", total > 0
                        ? "Đã sinh " + total + " hóa đơn (tháng " + previous.getMonthValue() + "/" + previous.getYear() + ": " + prevCount + ", tháng " + now.getMonthValue() + "/" + now.getYear() + ": " + currCount + ")."
                        : "Không có hóa đơn mới (đã đủ hoặc không có hợp đồng active).",
                "created", total
        ));
    }

    @PostMapping("/{id}/remind")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> remind(@PathVariable("id") Long id, @RequestBody RemindRequest request) {
        String channel = request != null && request.getChannel() != null ? request.getChannel().trim() : "";
        java.util.Optional<String> error = invoiceReminderService.sendReminder(id, channel);
        if (error.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", error.get()));
        }
        return ResponseEntity.ok(Map.of("message", "Đã gửi nhắc nợ thành công."));
    }
}
