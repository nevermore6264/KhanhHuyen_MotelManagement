package com.motelmanagement.controller;

import com.motelmanagement.domain.Role;
import com.motelmanagement.domain.Tenant;
import com.motelmanagement.domain.User;
import com.motelmanagement.dto.UserCreateDto;
import com.motelmanagement.dto.UserTenantLinkDto;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> list() {
        return userRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User create(@RequestBody UserCreateDto dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setFullName(dto.getFullName() != null ? dto.getFullName() : "");
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole() != null ? dto.getRole() : Role.STAFF);
        user.setActive(dto.isActive());
        User savedUser = userRepository.save(user);
        if (dto.getTenantId() != null && savedUser.getRole() == Role.TENANT) {
            tenantRepository.findById(dto.getTenantId()).ifPresent(tenant -> {
                tenant.setUser(savedUser);
                tenantRepository.save(tenant);
            });
        }
        return savedUser;
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> update(@PathVariable("id") Long id, @RequestBody User user) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setFullName(user.getFullName());
                    existing.setPhone(user.getPhone());
                    existing.setRole(user.getRole());
                    existing.setActive(user.isActive());
                    if (user.getPassword() != null && !user.getPassword().isBlank()) {
                        existing.setPassword(passwordEncoder.encode(user.getPassword()));
                    }
                    return ResponseEntity.ok(userRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> lock(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setActive(false);
                    return ResponseEntity.ok(userRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> unlock(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setActive(true);
                    return ResponseEntity.ok(userRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Chỉ gắn hoặc bỏ gắn tài khoản với khách thuê. tenantId = null để bỏ gắn. */
    @PutMapping("/{id}/tenant")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> linkTenant(@PathVariable("id") Long userId, @RequestBody UserTenantLinkDto dto) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        Tenant current = tenantRepository.findByUserId(userId);
        if (current != null) {
            current.setUser(null);
            tenantRepository.save(current);
        }
        if (dto.getTenantId() != null) {
            tenantRepository.findById(dto.getTenantId()).ifPresent(tenant -> {
                tenant.setUser(user);
                tenantRepository.save(tenant);
            });
        }
        return ResponseEntity.ok().build();
    }
}
