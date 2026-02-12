package com.motelmanagement.controller;

import com.motelmanagement.domain.Tenant;
import com.motelmanagement.domain.User;
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
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ROLE_STAFF')")
    public List<Tenant> list(@RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return tenantRepository.findByFullNameContainingIgnoreCase(q);
        }
        return tenantRepository.findAll();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('ROLE_TENANT')")
    public ResponseEntity<Tenant> me() {
        User user = currentUserService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        Tenant tenant = tenantRepository.findByUserId(user.getId());
        return tenant != null ? ResponseEntity.ok(tenant) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Tenant create(@RequestBody Tenant tenant) {
        if (tenant.getUser() != null && tenant.getUser().getId() != null) {
            tenant.setUser(userRepository.findById(tenant.getUser().getId()).orElse(null));
        }
        return tenantRepository.save(tenant);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Tenant> update(@PathVariable("id") Long id, @RequestBody Tenant tenant) {
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        tenantRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
