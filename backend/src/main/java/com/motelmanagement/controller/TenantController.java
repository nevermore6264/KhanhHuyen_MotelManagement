package com.motelmanagement.controller;

import com.motelmanagement.domain.Tenant;
import com.motelmanagement.domain.User;
import com.motelmanagement.dto.TenantCreateDto;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.repository.UserRepository;
import com.motelmanagement.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tenants")
public class TenantController {
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Tenant> list(@RequestParam(value = "q", required = false) String q) {
        User user = currentUserService.getCurrentUser();
        if (user != null && user.getRole() == com.motelmanagement.domain.Role.TENANT) {
            Tenant tenant = tenantRepository.findByUserId(user.getId());
            return tenant != null ? List.of(tenant) : List.of();
        }
        if (q != null && !q.isBlank()) {
            return tenantRepository.findByFullNameContainingIgnoreCase(q);
        }
        return tenantRepository.findAll();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Tenant> me() {
        User user = currentUserService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        Tenant tenant = tenantRepository.findByUserId(user.getId());
        return tenant != null ? ResponseEntity.ok(tenant) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Tenant create(@RequestBody TenantCreateDto dto) {
        Tenant tenant = new Tenant();
        tenant.setFullName(dto.getFullName());
        tenant.setPhone(dto.getPhone());
        tenant.setIdNumber(dto.getIdNumber());
        tenant.setAddress(dto.getAddress());
        tenant.setEmail(dto.getEmail());
        if (dto.getUserId() != null) {
            tenant.setUser(userRepository.findById(dto.getUserId()).orElse(null));
        }
        return tenantRepository.save(tenant);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> update(@PathVariable("id") Long id, @RequestBody Tenant tenant) {
        User user = currentUserService.getCurrentUser();
        if (user == null || user.getRole() != com.motelmanagement.domain.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        return tenantRepository.findById(id)
                .map(existing -> {
                    existing.setFullName(tenant.getFullName());
                    existing.setPhone(tenant.getPhone());
                    existing.setIdNumber(tenant.getIdNumber());
                    existing.setAddress(tenant.getAddress());
                    existing.setEmail(tenant.getEmail());
                    if (tenant.getUser() != null && tenant.getUser().getId() != null) {
                        existing.setUser(userRepository.findById(tenant.getUser().getId()).orElse(null));
                    }
                    return ResponseEntity.ok(tenantRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        User user = currentUserService.getCurrentUser();
        if (user == null || user.getRole() != com.motelmanagement.domain.Role.ADMIN) {
            return ResponseEntity.status(403).build();
        }
        tenantRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
