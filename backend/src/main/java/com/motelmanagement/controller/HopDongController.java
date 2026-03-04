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

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.domain.TrangThaiPhong;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.service.NguoiDungHienTaiService;

import lombok.RequiredArgsConstructor;

/** API hợp đồng thuê phòng (CRUD, lọc theo phòng/khách). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/hop-dong")
public class HopDongController {
    private final HopDongRepository hopDongRepository;
    private final PhongRepository phongRepository;
    private final KhachThueRepository khachThueRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<HopDong> layDanhSach() {
        return hopDongRepository.findAll();
    }

    @GetMapping("/cua-toi")
    @PreAuthorize("hasRole('TENANT')")
    public List<HopDong> layHopDongCuaToi() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return List.of();
        }
        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        if (khachThue == null) {
            return List.of();
        }
        return hopDongRepository.findByKhachThue_Id(khachThue.getId());
    }

    @GetMapping("/cua-toi/{id}")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<HopDong> layHopDongCuaToiTheoMa(@PathVariable("id") Long ma) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return ResponseEntity.notFound().build();
        }
        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        if (khachThue == null) {
            return ResponseEntity.notFound().build();
        }
        return hopDongRepository.findById(ma)
                .filter(hd -> hd.getKhachThue() != null && hd.getKhachThue().getId().equals(khachThue.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HopDong> tao(@RequestBody HopDong hopDong) {
        if (hopDong.getPhong() == null || hopDong.getPhong().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (hopDong.getKhachThue() == null || hopDong.getKhachThue().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Phong phong = phongRepository.findById(hopDong.getPhong().getId()).orElse(null);
        KhachThue khachThue = khachThueRepository.findById(hopDong.getKhachThue().getId()).orElse(null);
        if (phong == null || khachThue == null) {
            return ResponseEntity.badRequest().build();
        }
        hopDong.setPhong(phong);
        hopDong.setKhachThue(khachThue);
        HopDong daLuu = hopDongRepository.save(hopDong);
        phong.setTrangThai(TrangThaiPhong.OCCUPIED);
        phongRepository.save(phong);
        return ResponseEntity.ok(daLuu);
    }

    @PutMapping("/{id}/gia-han")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HopDong> giaHan(@PathVariable("id") Long ma, @RequestBody HopDong duLieu) {
        return hopDongRepository.findById(ma)
                .map(hienTai -> {
                    hienTai.setNgayKetThuc(duLieu.getNgayKetThuc());
                    return ResponseEntity.ok(hopDongRepository.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/ket-thuc")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HopDong> ketThuc(@PathVariable("id") Long ma) {
        return hopDongRepository.findById(ma)
                .map(hienTai -> {
                    hienTai.setTrangThai(TrangThaiHopDong.ENDED);
                    HopDong daLuu = hopDongRepository.save(hienTai);
                    Phong phong = hienTai.getPhong();
                    if (phong != null) {
                        phong.setTrangThai(TrangThaiPhong.AVAILABLE);
                        phongRepository.save(phong);
                    }
                    return ResponseEntity.ok(daLuu);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
