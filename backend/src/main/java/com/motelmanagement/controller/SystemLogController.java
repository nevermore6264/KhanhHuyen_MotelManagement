package com.motelmanagement.controller;

import com.motelmanagement.domain.SystemLog;
import com.motelmanagement.repository.SystemLogRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system-logs")
public class SystemLogController {
    private final SystemLogRepository systemLogRepository;

    public SystemLogController(SystemLogRepository systemLogRepository) {
        this.systemLogRepository = systemLogRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<SystemLog> list() {
        return systemLogRepository.findAll();
    }
}
