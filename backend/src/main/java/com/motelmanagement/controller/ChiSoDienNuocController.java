package com.motelmanagement.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.BangGiaDichVu;
import com.motelmanagement.domain.ChiSoDienNuoc;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.repository.BangGiaDichVuRepository;
import com.motelmanagement.repository.ChiSoDienNuocRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.service.TinhTienService;

import lombok.RequiredArgsConstructor;

/** API chỉ số điện/nước (nhập theo phòng, tháng). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chi-so-dien-nuoc")
public class ChiSoDienNuocController {
    private final ChiSoDienNuocRepository chiSoDienNuocRepository;
    private final PhongRepository phongRepository;
    private final BangGiaDichVuRepository bangGiaDichVuRepository;
    private final TinhTienService tinhTienService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<ChiSoDienNuoc> layDanhSach() {
        return chiSoDienNuocRepository.findAll();
    }

    /** Chỉ cho phép nhập chỉ số tháng hiện tại hoặc tháng trước đó */
    private static boolean choPhepThang(int thang, int nam) {
        YearMonth hienTai = YearMonth.now();
        YearMonth kyChiSo = YearMonth.of(nam, thang);
        return kyChiSo.equals(hienTai) || kyChiSo.equals(hienTai.minusMonths(1));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ChiSoDienNuoc> tao(@RequestBody ChiSoDienNuoc chiSo) {
        if (chiSo.getPhong() == null || chiSo.getPhong().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (!choPhepThang(chiSo.getThang(), chiSo.getNam())) {
            return ResponseEntity.badRequest().build();
        }
        Phong phong = phongRepository.findById(chiSo.getPhong().getId()).orElse(null);
        if (phong == null) {
            return ResponseEntity.badRequest().build();
        }
        chiSo.setPhong(phong);

        BangGiaDichVu bangGia = bangGiaDichVuRepository
                .findFirstByHieuLucTuLessThanEqualOrderByHieuLucTuDesc(
                        LocalDate.of(chiSo.getNam(), chiSo.getThang(), 1))
                .orElse(null);

        BigDecimal donGiaDien = bangGia != null && bangGia.getGiaDien() != null
                ? bangGia.getGiaDien()
                : BigDecimal.ZERO;
        BigDecimal donGiaNuoc = bangGia != null && bangGia.getGiaNuoc() != null
                ? bangGia.getGiaNuoc()
                : BigDecimal.ZERO;

        int dungDien = Math.max(0, chiSo.getDienMoi() - chiSo.getDienCu());
        int dungNuoc = Math.max(0, chiSo.getNuocMoi() - chiSo.getNuocCu());

        chiSo.setTienDien(donGiaDien.multiply(BigDecimal.valueOf(dungDien)));
        chiSo.setTienNuoc(donGiaNuoc.multiply(BigDecimal.valueOf(dungNuoc)));

        ChiSoDienNuoc daLuu = chiSoDienNuocRepository.save(chiSo);
        tinhTienService.taoHoacCapNhatHoaDonTuChiSo(daLuu);
        return ResponseEntity.ok(daLuu);
    }
}
