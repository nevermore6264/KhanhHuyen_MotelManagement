package com.motelmanagement.service;

import com.motelmanagement.config.MailProperties;
import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.repository.InvoiceRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceReminderService {

    private final InvoiceRepository invoiceRepository;
    private final MailProperties mailProperties;
    private final SmsSender smsSender;

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    private static String formatMoney(BigDecimal amount) {
        if (amount == null) return "0";
        return String.format("%,d", amount.longValue()) + " VNĐ";
    }

    private static String buildReminderBody(Invoice invoice) {
        String room = invoice.getRoom() != null ? invoice.getRoom().getCode() : "—";
        String period = invoice.getMonth() + "/" + invoice.getYear();
        String total = formatMoney(invoice.getTotal());
        String name = invoice.getTenant() != null ? invoice.getTenant().getFullName() : "Khách";
        return String.format(
                "Kính gửi %s,\n\nNhắc nợ hóa đơn tiền trọ:\n- Phòng: %s\n- Kỳ: %s\n- Tổng cộng: %s\n\nVui lòng thanh toán sớm.\nTrân trọng.",
                name, room, period, total
        );
    }

    private static String buildReminderSmsText(Invoice invoice) {
        String room = invoice.getRoom() != null ? invoice.getRoom().getCode() : "—";
        String period = invoice.getMonth() + "/" + invoice.getYear();
        String total = formatMoney(invoice.getTotal());
        return String.format("Nhac no: Phong %s, ky %s, tong %s. Vui long thanh toan.", room, period, total);
    }

    /**
     * Gửi nhắc nợ qua email (JavaMailSender) hoặc SMS (gateway HTTP).
     * Nếu chưa cấu hình mail/SMS thì vẫn ghi log và cập nhật lastReminder*At.
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
            String roomCode = invoice.getRoom() != null ? invoice.getRoom().getCode() : null;
            log.info("Reminder EMAIL: invoiceId={}, to={}, room={}, period={}/{}",
                    invoiceId, toEmail, roomCode, invoice.getMonth(), invoice.getYear());

            String body = buildReminderBody(invoice);
            if (javaMailSender != null) {
                try {
                    MimeMessage message = javaMailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    helper.setFrom(mailProperties.getFrom());
                    helper.setTo(toEmail.trim());
                    helper.setSubject(String.format("Nhắc nợ - Hóa đơn phòng %s kỳ %d/%d",
                            roomCode != null ? roomCode : "", invoice.getMonth(), invoice.getYear()));
                    helper.setText(body, false);
                    javaMailSender.send(message);
                    log.info("Email sent to {}", toEmail);
                } catch (MessagingException e) {
                    log.warn("Email send failed: {}", e.getMessage());
                    return Optional.of("Gửi email thất bại: " + e.getMessage());
                }
            }

            invoice.setLastReminderEmailAt(LocalDateTime.now());
            invoice.setReminderEmailCount(invoice.getReminderEmailCount() + 1);
            invoice.setLastReminderEmailMessage(body);
            invoiceRepository.save(invoice);
            return Optional.empty();
        } else {
            if (toPhone == null || toPhone.isBlank()) {
                return Optional.of("Khách thuê chưa có số điện thoại.");
            }
            String roomCode = invoice.getRoom() != null ? invoice.getRoom().getCode() : null;
            log.info("Reminder SMS: invoiceId={}, to={}, room={}, period={}/{}",
                    invoiceId, toPhone, roomCode, invoice.getMonth(), invoice.getYear());

            String smsText = buildReminderSmsText(invoice);
            boolean sent = smsSender.send(toPhone.trim(), smsText);
            if (!sent && smsSender.isConfigured()) {
                return Optional.of("Gửi SMS thất bại. Kiểm tra cấu hình gateway.");
            }

            invoice.setLastReminderSmsAt(LocalDateTime.now());
            invoice.setReminderSmsCount(invoice.getReminderSmsCount() + 1);
            invoice.setLastReminderSmsMessage(smsText);
            invoiceRepository.save(invoice);
            return Optional.empty();
        }
    }
}
