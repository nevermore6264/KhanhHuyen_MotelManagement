package com.motelmanagement.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
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
import com.motelmanagement.domain.HopDongThanhVien;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.domain.TrangThaiPhong;
import com.motelmanagement.dto.HopDongGiaHanDto;
import com.motelmanagement.dto.HopDongTaoDto;
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
        return hopDongRepository.findThuocKhachThue(khachThue.getId());
    }

    @GetMapping("/cua-toi/{id}")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<HopDong> layHopDongCuaToiTheoMa(@PathVariable("id") String ma) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return ResponseEntity.notFound().build();
        }
        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        if (khachThue == null) {
            return ResponseEntity.notFound().build();
        }
        if (!hopDongRepository.khachCoTrongHopDong(ma, khachThue.getId())) {
            return ResponseEntity.notFound().build();
        }
        return hopDongRepository.findById(ma).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HopDong> tao(@RequestBody HopDongTaoDto dto) {
        if (dto == null
                || dto.getPhongId() == null
                || dto.getKhachThueIds() == null
                || dto.getKhachThueIds().isEmpty()
                || dto.getDaiDienKhachThueId() == null
                || dto.getStartDate() == null
                || dto.getEndDate() == null) {
            return ResponseEntity.badRequest().build();
        }
        LinkedHashSet<String> ids = new LinkedHashSet<>(dto.getKhachThueIds());
        if (!ids.contains(dto.getDaiDienKhachThueId())) {
            return ResponseEntity.badRequest().build();
        }
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            return ResponseEntity.badRequest().build();
        }
        Phong phong = phongRepository.findById(dto.getPhongId()).orElse(null);
        if (phong == null || phong.getTrangThai() != TrangThaiPhong.AVAILABLE) {
            return ResponseEntity.badRequest().build();
        }
        KhachThue daiDien = khachThueRepository.findById(dto.getDaiDienKhachThueId()).orElse(null);
        if (daiDien == null) {
            return ResponseEntity.badRequest().build();
        }
        List<KhachThue> danhSachKhach = new ArrayList<>();
        for (String kid : ids) {
            KhachThue kt = khachThueRepository.findById(kid).orElse(null);
            if (kt == null) {
                return ResponseEntity.badRequest().build();
            }
            if (hopDongRepository.demHopDongActiveCoKhach(kid, TrangThaiHopDong.ACTIVE) > 0) {
                return ResponseEntity.badRequest().build();
            }
            danhSachKhach.add(kt);
        }
        HopDong hopDong = new HopDong();
        hopDong.setPhong(phong);
        hopDong.setKhachThue(daiDien);
        hopDong.setNgayBatDau(dto.getStartDate());
        hopDong.setNgayKetThuc(dto.getEndDate());
        hopDong.setTienCoc(dto.getDeposit());
        hopDong.setTienThue(dto.getRent());
        hopDong.setTrangThai(TrangThaiHopDong.ACTIVE);
        List<HopDongThanhVien> thanhVien = new ArrayList<>();
        for (KhachThue kt : danhSachKhach) {
            HopDongThanhVien tv = new HopDongThanhVien();
            tv.setHopDong(hopDong);
            tv.setKhachThue(kt);
            tv.setLaDaiDien(kt.getId().equals(dto.getDaiDienKhachThueId()));
            thanhVien.add(tv);
        }
        hopDong.setThanhVien(thanhVien);
        HopDong daLuu = hopDongRepository.save(hopDong);
        phong.setTrangThai(TrangThaiPhong.OCCUPIED);
        phongRepository.save(phong);
        return ResponseEntity.ok(daLuu);
    }

    @PutMapping("/{id}/gia-han")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HopDong> giaHan(
            @PathVariable("id") String ma, @RequestBody(required = false) HopDongGiaHanDto duLieu) {
        LocalDate ngayKetThuc = duLieu != null ? duLieu.layNgayKetThuc() : null;
        if (ngayKetThuc == null) {
            return ResponseEntity.badRequest().build();
        }
        return hopDongRepository
                .findById(ma)
                .map(hienTai -> {
                    hienTai.setNgayKetThuc(ngayKetThuc);
                    return ResponseEntity.ok(hopDongRepository.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/ket-thuc")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HopDong> ketThuc(@PathVariable("id") String ma) {
        return hopDongRepository
                .findById(ma)
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
