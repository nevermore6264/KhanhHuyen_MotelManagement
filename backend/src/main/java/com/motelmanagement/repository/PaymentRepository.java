package com.motelmanagement.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.motelmanagement.domain.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceId(Long invoiceId);

    List<Payment> findByInvoice_Tenant_IdOrderByPaidAtDesc(Long tenantId, Pageable pageable);
}
