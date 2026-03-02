package com.motelmanagement.controller;

import com.motelmanagement.domain.BangGiaDichVu;
import com.motelmanagement.repository.KhoBangGiaDichVu;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** API đơn giá dịch vụ (điện, nước theo từng thời điểm). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/service-prices")
public class BangGiaController {
    private final KhoBangGiaDichVu khoBangGiaDichVu;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<BangGiaDichVu> layDanhSach() {
        return khoBangGiaDichVu.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public BangGiaDichVu tao(@RequestBody BangGiaDichVu bangGia) {
        return khoBangGiaDichVu.save(bangGia);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BangGiaDichVu> capNhat(@PathVariable("id") Long ma, @RequestBody BangGiaDichVu duLieu) {
        return khoBangGiaDichVu.findById(ma)
                .map(hienTai -> {
                    hienTai.setRoomPrice(duLieu.getRoomPrice());
                    hienTai.setElectricityPrice(duLieu.getElectricityPrice());
                    hienTai.setWaterPrice(duLieu.getWaterPrice());
                    hienTai.setEffectiveFrom(duLieu.getEffectiveFrom());
                    return ResponseEntity.ok(khoBangGiaDichVu.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> xoa(@PathVariable("id") Long ma) {
        khoBangGiaDichVu.deleteById(ma);
        return ResponseEntity.ok().build();
    }
}
