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
import com.motelmanagement.repository.KhuVucRepository;
import com.motelmanagement.repository.PhongRepository;

import lombok.RequiredArgsConstructor;

/** API phòng: CRUD, lọc theo khu vực/trạng thái. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/phong")
public class PhongController {
    private final PhongRepository phongRepository;
    private final KhuVucRepository khuVucRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Phong> layDanhSach() {
        return phongRepository.findAll();
    }

    @GetMapping("/con-trong")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Phong> layDanhSachConTrong() {
        return phongRepository.findByTrangThai(TrangThaiPhong.AVAILABLE);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Phong tao(@RequestBody Phong phong) {
        if (phong.getKhuVuc() != null && phong.getKhuVuc().getId() != null) {
            KhuVuc khuVuc = khuVucRepository.findById(phong.getKhuVuc().getId()).orElse(null);
            phong.setKhuVuc(khuVuc);
        }
        return phongRepository.save(phong);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Phong> capNhat(@PathVariable("id") Long ma, @RequestBody Phong phong) {
        return phongRepository.findById(ma)
                .map(hienTai -> {
                    hienTai.setMaPhong(phong.getMaPhong());
                    hienTai.setTang(phong.getTang());
                    hienTai.setTrangThai(phong.getTrangThai());
                    hienTai.setGiaHienTai(phong.getGiaHienTai());
                    hienTai.setDienTich(phong.getDienTich());
                    if (phong.getKhuVuc() != null && phong.getKhuVuc().getId() != null) {
                        hienTai.setKhuVuc(khuVucRepository.findById(phong.getKhuVuc().getId()).orElse(null));
                    }
                    return ResponseEntity.ok(phongRepository.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> xoa(@PathVariable("id") Long ma) {
        phongRepository.deleteById(ma);
        return ResponseEntity.ok().build();
    }
}
