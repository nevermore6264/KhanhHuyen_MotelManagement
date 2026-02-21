package com.motelmanagement.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.motelmanagement.domain.Tenant;
import com.motelmanagement.domain.User;
import com.motelmanagement.dto.TenantCreateDto;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.repository.UserRepository;
import com.motelmanagement.service.CurrentUserService;
import com.motelmanagement.service.TenantFileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tenants")
public class TenantController {
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final TenantFileService tenantFileService;

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

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
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

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> createWithFiles(
            @RequestParam String fullName,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String idNumber,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) MultipartFile portrait,
            @RequestParam(required = false) MultipartFile idCard) {
        try {
            Tenant tenant = new Tenant();
            tenant.setFullName(fullName != null ? fullName.trim() : "");
            tenant.setPhone(phone != null && !phone.isBlank() ? phone.trim() : null);
            tenant.setIdNumber(idNumber != null && !idNumber.isBlank() ? idNumber.trim() : null);
            tenant.setAddress(address != null && !address.isBlank() ? address.trim() : null);
            tenant.setEmail(email != null && !email.isBlank() ? email.trim() : null);
            if (userId != null) {
                tenant.setUser(userRepository.findById(userId).orElse(null));
            }
            if (portrait != null && !portrait.isEmpty()) {
                tenant.setPortraitImagePath(tenantFileService.saveImage(portrait));
            }
            if (idCard != null && !idCard.isEmpty()) {
                tenant.setIdCardImagePath(tenantFileService.saveImage(idCard));
            }
            return ResponseEntity.ok(tenantRepository.save(tenant));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lưu ảnh thất bại");
        }
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
