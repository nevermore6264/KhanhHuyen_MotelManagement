package com.motelmanagement.controller;

import com.motelmanagement.domain.SystemLog;
import com.motelmanagement.repository.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/system-logs")
public class SystemLogController {
    private final SystemLogRepository systemLogRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<SystemLog> list() {
        return systemLogRepository.findAll();
    }
}
