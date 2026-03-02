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

import com.motelmanagement.domain.KhuVuc;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiPhong;
import com.motelmanagement.repository.KhoKhuVuc;
import com.motelmanagement.repository.KhoPhong;

import lombok.RequiredArgsConstructor;

/** API phòng: CRUD, lọc theo khu vực/trạng thái. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class PhongController {
    private final KhoPhong khoPhong;
    private final KhoKhuVuc khoKhuVuc;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Phong> layDanhSach() {
        return khoPhong.findAll();
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Phong> layDanhSachConTrong() {
        return khoPhong.findByStatus(TrangThaiPhong.AVAILABLE);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Phong tao(@RequestBody Phong phong) {
        if (phong.getKhuVuc() != null && phong.getKhuVuc().getId() != null) {
            KhuVuc khuVuc = khoKhuVuc.findById(phong.getKhuVuc().getId()).orElse(null);
            phong.setKhuVuc(khuVuc);
        }
        return khoPhong.save(phong);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Phong> capNhat(@PathVariable("id") Long ma, @RequestBody Phong phong) {
        return khoPhong.findById(ma)
                .map(hienTai -> {
                    hienTai.setCode(phong.getCode());
                    hienTai.setFloor(phong.getFloor());
                    hienTai.setStatus(phong.getStatus());
                    hienTai.setCurrentPrice(phong.getCurrentPrice());
                    hienTai.setAreaSize(phong.getAreaSize());
                    if (phong.getKhuVuc() != null && phong.getKhuVuc().getId() != null) {
                        hienTai.setKhuVuc(khoKhuVuc.findById(phong.getKhuVuc().getId()).orElse(null));
                    }
                    return ResponseEntity.ok(khoPhong.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> xoa(@PathVariable("id") Long ma) {
        khoPhong.deleteById(ma);
        return ResponseEntity.ok().build();
    }
}
