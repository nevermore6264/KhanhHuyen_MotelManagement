package com.motelmanagement.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.NhatKyHeThong;
import com.motelmanagement.repository.NhatKyHeThongRepository;

import lombok.RequiredArgsConstructor;

/** API nhật ký hệ thống (lọc, phân trang). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/nhat-ky")
public class NhatKyController {
    private final NhatKyHeThongRepository nhatKyHeThongRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<NhatKyHeThong> layDanhSach() {
        return nhatKyHeThongRepository.findAll();
    }
}
