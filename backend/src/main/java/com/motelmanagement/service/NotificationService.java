package com.motelmanagement.service;

import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.Notification;
import com.motelmanagement.domain.User;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.NotificationRepository;
import com.motelmanagement.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class NotificationService {
    private final InvoiceRepository invoiceRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(InvoiceRepository invoiceRepository,
                               NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.invoiceRepository = invoiceRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

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
}
