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
import com.motelmanagement.repository.KhoHopDong;
import com.motelmanagement.repository.KhoPhong;
import com.motelmanagement.repository.KhoKhachThue;
import com.motelmanagement.service.NguoiDungHienTaiService;

import lombok.RequiredArgsConstructor;

/** API hợp đồng thuê phòng (CRUD, lọc theo phòng/khách). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contracts")
public class HopDongController {
    private final KhoHopDong khoHopDong;
    private final KhoPhong khoPhong;
    private final KhoKhachThue khoKhachThue;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<HopDong> layDanhSach() {
        return khoHopDong.findAll();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TENANT')")
    public List<HopDong> layHopDongCuaToi() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return List.of();
        }
        KhachThue khachThue = khoKhachThue.findByUser_Id(nguoiDung.getId());
        if (khachThue == null) {
            return List.of();
        }
        return khoHopDong.findByKhachThue_Id(khachThue.getId());
    }

    @GetMapping("/me/{id}")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<HopDong> layHopDongCuaToiTheoMa(@PathVariable("id") Long ma) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return ResponseEntity.notFound().build();
        }
        KhachThue khachThue = khoKhachThue.findByUser_Id(nguoiDung.getId());
        if (khachThue == null) {
            return ResponseEntity.notFound().build();
        }
        return khoHopDong.findById(ma)
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
        Phong phong = khoPhong.findById(hopDong.getPhong().getId()).orElse(null);
        KhachThue khachThue = khoKhachThue.findById(hopDong.getKhachThue().getId()).orElse(null);
        if (phong == null || khachThue == null) {
            return ResponseEntity.badRequest().build();
        }
        hopDong.setPhong(phong);
        hopDong.setKhachThue(khachThue);
        HopDong daLuu = khoHopDong.save(hopDong);
        phong.setStatus(TrangThaiPhong.OCCUPIED);
        khoPhong.save(phong);
        return ResponseEntity.ok(daLuu);
    }

    @PutMapping("/{id}/extend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HopDong> giaHan(@PathVariable("id") Long ma, @RequestBody HopDong duLieu) {
        return khoHopDong.findById(ma)
                .map(hienTai -> {
                    hienTai.setEndDate(duLieu.getEndDate());
                    return ResponseEntity.ok(khoHopDong.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/end")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HopDong> ketThuc(@PathVariable("id") Long ma) {
        return khoHopDong.findById(ma)
                .map(hienTai -> {
                    hienTai.setStatus(TrangThaiHopDong.ENDED);
                    HopDong daLuu = khoHopDong.save(hienTai);
                    Phong phong = hienTai.getPhong();
                    if (phong != null) {
                        phong.setStatus(TrangThaiPhong.AVAILABLE);
                        khoPhong.save(phong);
                    }
                    return ResponseEntity.ok(daLuu);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
