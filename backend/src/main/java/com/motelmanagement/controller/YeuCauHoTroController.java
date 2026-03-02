package com.motelmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.YeuCauHoTro;
import com.motelmanagement.repository.KhoKhachThue;
import com.motelmanagement.repository.KhoYeuCauHoTro;
import com.motelmanagement.service.NguoiDungHienTaiService;

import lombok.RequiredArgsConstructor;

/** API yêu cầu hỗ trợ từ khách thuê. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/support-requests")
public class YeuCauHoTroController {
    private final KhoYeuCauHoTro khoYeuCauHoTro;
    private final KhoKhachThue khoKhachThue;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<YeuCauHoTro> layDanhSach() {
        return khoYeuCauHoTro.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<?> tao(@RequestBody YeuCauHoTro yeuCau) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return ResponseEntity.badRequest().build();
        }
        KhachThue khachThue = khoKhachThue.findByUser_Id(nguoiDung.getId());
        if (khachThue == null) {
            KhachThue moiTao = new KhachThue();
            moiTao.setFullName(nguoiDung.getHoTen());
            moiTao.setPhone(nguoiDung.getSoDienThoai());
            moiTao.setUser(nguoiDung);
            khachThue = khoKhachThue.save(moiTao);
        }
        yeuCau.setKhachThue(khachThue);
        return ResponseEntity.ok(khoYeuCauHoTro.save(yeuCau));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<YeuCauHoTro> capNhat(@PathVariable("id") Long ma, @RequestBody YeuCauHoTro yeuCau) {
        return khoYeuCauHoTro.findById(ma)
                .map(hienTai -> {
                    if (yeuCau.getStatus() != null) {
                        hienTai.setStatus(yeuCau.getStatus());
                    }
                    if (yeuCau.getTitle() != null) {
                        hienTai.setTitle(yeuCau.getTitle());
                    }
                    if (yeuCau.getDescription() != null) {
                        hienTai.setDescription(yeuCau.getDescription());
                    }
                    hienTai.setUpdatedAt(java.time.LocalDateTime.now());
                    return ResponseEntity.ok(khoYeuCauHoTro.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
