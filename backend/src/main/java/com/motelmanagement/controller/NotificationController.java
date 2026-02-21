package com.motelmanagement.controller;

import com.motelmanagement.domain.Notification;
import com.motelmanagement.domain.User;
import com.motelmanagement.dto.NotificationCreateDto;
import com.motelmanagement.repository.NotificationRepository;
import com.motelmanagement.service.CurrentUserService;
import com.motelmanagement.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public List<Notification> list() {
        User user = currentUserService.getCurrentUser();
        if (user == null) {
            return List.of();
        }
        return notificationRepository.findByUser(user);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public ResponseEntity<Notification> markRead(@PathVariable("id") Long id) {
        return notificationRepository.findById(id)
                .map(existing -> {
                    existing.setReadFlag(true);
                    return ResponseEntity.ok(notificationRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody NotificationCreateDto dto) {
        if (dto.getMessage() == null || dto.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body("Nội dung thông báo không được để trống.");
        }
        notificationService.createAndPush(dto.getMessage(), dto.getUserId());
        return ResponseEntity.ok().build();
    }
}
