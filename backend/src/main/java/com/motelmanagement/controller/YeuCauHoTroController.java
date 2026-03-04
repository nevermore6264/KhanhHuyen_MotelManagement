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
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.YeuCauHoTroRepository;
import com.motelmanagement.service.NguoiDungHienTaiService;

import lombok.RequiredArgsConstructor;

/** API yêu cầu hỗ trợ từ khách thuê. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/yeu-cau-ho-tro")
public class YeuCauHoTroController {
    private final YeuCauHoTroRepository yeuCauHoTroRepository;
    private final KhachThueRepository khachThueRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<YeuCauHoTro> layDanhSach() {
        return yeuCauHoTroRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<?> tao(@RequestBody YeuCauHoTro yeuCau) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return ResponseEntity.badRequest().build();
        }
        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        if (khachThue == null) {
            KhachThue moiTao = new KhachThue();
            moiTao.setHoTen(nguoiDung.getHoTen());
            moiTao.setSoDienThoai(nguoiDung.getSoDienThoai());
            moiTao.setNguoiDung(nguoiDung);
            khachThue = khachThueRepository.save(moiTao);
        }
        yeuCau.setKhachThue(khachThue);
        return ResponseEntity.ok(yeuCauHoTroRepository.save(yeuCau));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<YeuCauHoTro> capNhat(@PathVariable("id") Long ma, @RequestBody YeuCauHoTro yeuCau) {
        return yeuCauHoTroRepository.findById(ma)
                .map(hienTai -> {
                    if (yeuCau.getTrangThai() != null) {
                        hienTai.setTrangThai(yeuCau.getTrangThai());
                    }
                    if (yeuCau.getTieuDe() != null) {
                        hienTai.setTieuDe(yeuCau.getTieuDe());
                    }
                    if (yeuCau.getMoTa() != null) {
                        hienTai.setMoTa(yeuCau.getMoTa());
                    }
                    hienTai.setNgayCapNhat(java.time.LocalDateTime.now());
                    return ResponseEntity.ok(yeuCauHoTroRepository.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
