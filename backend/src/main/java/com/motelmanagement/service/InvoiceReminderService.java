package com.motelmanagement.service;

import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceReminderService {

    private final InvoiceRepository invoiceRepository;

    /**
     * Gửi nhắc nợ qua email hoặc SMS.
     * Hiện tại ghi log; có thể tích hợp JavaMailSender / SMS gateway sau.
     */
    public Optional<String> sendReminder(Long invoiceId, String channel) {
        if (!"email".equalsIgnoreCase(channel) && !"sms".equalsIgnoreCase(channel)) {
            return Optional.of("Kênh không hợp lệ. Chọn email hoặc sms.");
        }
        Invoice invoice = invoiceRepository.findById(invoiceId).orElse(null);
        if (invoice == null) {
            return Optional.of("Không tìm thấy hóa đơn.");
        }
        if (invoice.getTenant() == null) {
            return Optional.of("Hóa đơn chưa gắn khách thuê.");
        }
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            return Optional.of("Hóa đơn đã thanh toán, không cần nhắc.");
        }

        String toEmail = invoice.getTenant().getEmail();
        String toPhone = invoice.getTenant().getPhone();
        if ("email".equalsIgnoreCase(channel)) {
            if (toEmail == null || toEmail.isBlank()) {
                return Optional.of("Khách thuê chưa có email.");
            }
            log.info("Reminder EMAIL: invoiceId={}, to={}, room={}, period={}/{}", 
                    invoiceId, toEmail, 
                    invoice.getRoom() != null ? invoice.getRoom().getCode() : null,
                    invoice.getMonth(), invoice.getYear());
            invoice.setLastReminderEmailAt(LocalDateTime.now());
            invoiceRepository.save(invoice);
            // TODO: tích hợp JavaMailSender khi cấu hình mail
            return Optional.empty();
        } else {
            if (toPhone == null || toPhone.isBlank()) {
                return Optional.of("Khách thuê chưa có số điện thoại.");
            }
            log.info("Reminder SMS: invoiceId={}, to={}, room={}, period={}/{}", 
                    invoiceId, toPhone,
                    invoice.getRoom() != null ? invoice.getRoom().getCode() : null,
                    invoice.getMonth(), invoice.getYear());
            invoice.setLastReminderSmsAt(LocalDateTime.now());
            invoiceRepository.save(invoice);
            // TODO: tích hợp SMS gateway khi có cấu hình
            return Optional.empty();
        }
    }
}
