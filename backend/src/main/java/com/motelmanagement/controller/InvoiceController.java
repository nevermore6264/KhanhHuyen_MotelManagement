package com.motelmanagement.controller;

import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.Tenant;
import com.motelmanagement.domain.User;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/invoices")
public class InvoiceController {
    private final InvoiceRepository invoiceRepository;
    private final TenantRepository tenantRepository;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Invoice> list() {
        return invoiceRepository.findAll();
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
    public ResponseEntity<Invoice> updateStatus(@PathVariable("id") Long id, @RequestParam InvoiceStatus status) {
        return invoiceRepository.findById(id)
                .map(existing -> {
                    existing.setStatus(status);
                    return ResponseEntity.ok(invoiceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
