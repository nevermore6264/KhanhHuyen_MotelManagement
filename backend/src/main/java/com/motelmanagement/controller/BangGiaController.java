package com.motelmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.BangGiaDichVu;
import com.motelmanagement.repository.BangGiaDichVuRepository;

import lombok.RequiredArgsConstructor;

/** API đơn giá dịch vụ (điện, nước theo từng thời điểm). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bang-gia-dich-vu")
public class BangGiaController {
    private final BangGiaDichVuRepository bangGiaDichVuRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<BangGiaDichVu> layDanhSach() {
        return bangGiaDichVuRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public BangGiaDichVu tao(@RequestBody BangGiaDichVu bangGia) {
        return bangGiaDichVuRepository.save(bangGia);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BangGiaDichVu> capNhat(@PathVariable("id") Long ma, @RequestBody BangGiaDichVu duLieu) {
        return bangGiaDichVuRepository.findById(ma)
                .map(hienTai -> {
                    hienTai.setGiaPhong(duLieu.getGiaPhong());
                    hienTai.setGiaDien(duLieu.getGiaDien());
                    hienTai.setGiaNuoc(duLieu.getGiaNuoc());
                    hienTai.setHieuLucTu(duLieu.getHieuLucTu());
                    return ResponseEntity.ok(bangGiaDichVuRepository.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> xoa(@PathVariable("id") Long ma) {
        bangGiaDichVuRepository.deleteById(ma);
        return ResponseEntity.ok().build();
    }
}
