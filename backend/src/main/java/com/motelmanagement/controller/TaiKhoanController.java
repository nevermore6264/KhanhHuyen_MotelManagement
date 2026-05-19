package com.motelmanagement.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.dto.CapNhatHoSoCaNhanDto;
import com.motelmanagement.dto.HoSoCaNhanDto;
import com.motelmanagement.service.HoSoCaNhanService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tai-khoan")
public class TaiKhoanController {
    private final HoSoCaNhanService hoSoCaNhanService;

    @GetMapping("/cua-toi")
    @PreAuthorize("isAuthenticated()")
    public HoSoCaNhanDto layCuaToi() {
        return hoSoCaNhanService.layHoSoCuaToi();
    }

    @PutMapping("/cua-toi")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> capNhatCuaToi(@Valid @RequestBody CapNhatHoSoCaNhanDto yeuCau) {
        HoSoCaNhanDto hoSo = hoSoCaNhanService.capNhatHoSoCuaToi(yeuCau);
        return ResponseEntity.ok(Map.of(
                "message", "Đã cập nhật hồ sơ.",
                "profile", hoSo));
    }
}
