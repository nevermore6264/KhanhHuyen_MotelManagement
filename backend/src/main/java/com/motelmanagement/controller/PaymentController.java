package com.motelmanagement.controller;

import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.Payment;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentController(PaymentRepository paymentRepository, InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public List<Payment> listByInvoice(@PathVariable("invoiceId") Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Payment> create(@RequestBody Payment payment) {
        if (payment.getInvoice() == null || payment.getInvoice().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Invoice invoice = invoiceRepository.findById(payment.getInvoice().getId()).orElse(null);
        if (invoice == null) {
            return ResponseEntity.badRequest().build();
        }
        payment.setInvoice(invoice);
        Payment saved = paymentRepository.save(payment);

        BigDecimal totalPaid = paymentRepository.findByInvoiceId(invoice.getId()).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(invoice.getTotal()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(InvoiceStatus.PARTIAL);
        }
        invoiceRepository.save(invoice);
        return ResponseEntity.ok(saved);
    }
}
