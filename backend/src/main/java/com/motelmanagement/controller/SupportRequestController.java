package com.motelmanagement.controller;

import com.motelmanagement.domain.SupportRequest;
import com.motelmanagement.domain.Tenant;
import com.motelmanagement.domain.User;
import com.motelmanagement.repository.SupportRequestRepository;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/support-requests")
public class SupportRequestController {
    private final SupportRequestRepository supportRequestRepository;
    private final TenantRepository tenantRepository;
    private final CurrentUserService currentUserService;

    public SupportRequestController(SupportRequestRepository supportRequestRepository,
                                    TenantRepository tenantRepository,
                                    CurrentUserService currentUserService) {
        this.supportRequestRepository = supportRequestRepository;
        this.tenantRepository = tenantRepository;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<SupportRequest> list() {
        return supportRequestRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<SupportRequest> create(@RequestBody SupportRequest request) {
        User user = currentUserService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        Tenant tenant = tenantRepository.findByUserId(user.getId());
        if (tenant == null) {
            return ResponseEntity.badRequest().build();
        }
        request.setTenant(tenant);
        return ResponseEntity.ok(supportRequestRepository.save(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<SupportRequest> update(@PathVariable("id") Long id, @RequestBody SupportRequest request) {
        return supportRequestRepository.findById(id)
                .map(existing -> {
                    existing.setStatus(request.getStatus());
                    existing.setTitle(request.getTitle());
                    existing.setDescription(request.getDescription());
                    existing.setUpdatedAt(java.time.LocalDateTime.now());
                    return ResponseEntity.ok(supportRequestRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
