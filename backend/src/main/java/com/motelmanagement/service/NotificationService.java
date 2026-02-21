package com.motelmanagement.service;

import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.Notification;
import com.motelmanagement.domain.User;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.NotificationRepository;
import com.motelmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(cron = "0 0 9 * * ?")
    public void remindPaymentDue() {
        LocalDate now = LocalDate.now();
        List<Invoice> unpaid = invoiceRepository.findByStatus(InvoiceStatus.UNPAID);
        for (Invoice invoice : unpaid) {
            if (invoice.getTenant() != null && invoice.getTenant().getUser() != null) {
                User user = invoice.getTenant().getUser();
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setMessage(
                        "Nhắc thanh toán hóa đơn " + invoice.getMonth() + "/" + invoice.getYear()
                                + " cho phòng " + invoice.getRoom().getCode()
                                + " vào " + now);
                notificationRepository.save(notification);
            }
        }
    }

    /**
     * Tạo thông báo và đẩy realtime qua WebSocket.
     * @param message Nội dung thông báo
     * @param userId Null = gửi cho tất cả user; có giá trị = gửi cho user đó
     */
    public void createAndPush(String message, Long userId) {
        if (message == null || message.isBlank()) return;
        List<User> targets = userId != null
                ? userRepository.findById(userId).map(List::of).orElse(List.of())
                : userRepository.findAll();
        for (User user : targets) {
            Notification n = new Notification();
            n.setUser(user);
            n.setMessage(message.trim());
            n = notificationRepository.save(n);
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", n.getId());
            payload.put("message", n.getMessage());
            payload.put("readFlag", n.isReadFlag());
            payload.put("sentAt", n.getSentAt() != null ? n.getSentAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null);
            messagingTemplate.convertAndSendToUser(user.getUsername(), "/queue/notifications", payload);
        }
    }
}
