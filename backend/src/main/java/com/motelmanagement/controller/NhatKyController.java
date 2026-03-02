package com.motelmanagement.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.NhatKyHeThong;
import com.motelmanagement.repository.KhoNhatKyHeThong;

import lombok.RequiredArgsConstructor;

/** API nhật ký hệ thống (lọc, phân trang). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/system-logs")
public class NhatKyController {
    private final KhoNhatKyHeThong khoNhatKyHeThong;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<NhatKyHeThong> layDanhSach() {
        return khoNhatKyHeThong.findAll();
    }
}
