package com.motelmanagement.controller;

import com.motelmanagement.domain.BangGiaDichVu;
import com.motelmanagement.domain.ChiSoDienNuoc;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.repository.KhoChiSoDienNuoc;
import com.motelmanagement.repository.KhoPhong;
import com.motelmanagement.repository.KhoBangGiaDichVu;
import com.motelmanagement.service.TinhTienService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/** API chỉ số điện/nước (nhập theo phòng, tháng). */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meter-readings")
public class ChiSoDienNuocController {
    private final KhoChiSoDienNuoc khoChiSoDienNuoc;
    private final KhoPhong khoPhong;
    private final KhoBangGiaDichVu khoBangGiaDichVu;
    private final TinhTienService tinhTienService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<ChiSoDienNuoc> layDanhSach() {
        return khoChiSoDienNuoc.findAll();
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
        if (!choPhepThang(chiSo.getMonth(), chiSo.getYear())) {
            return ResponseEntity.badRequest().build();
        }
        Phong phong = khoPhong.findById(chiSo.getPhong().getId()).orElse(null);
        if (phong == null) {
            return ResponseEntity.badRequest().build();
        }
        chiSo.setPhong(phong);

        BangGiaDichVu bangGia = khoBangGiaDichVu
                .findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
                        LocalDate.of(chiSo.getYear(), chiSo.getMonth(), 1))
                .orElse(null);

        BigDecimal donGiaDien = bangGia != null && bangGia.getElectricityPrice() != null
                ? bangGia.getElectricityPrice()
                : BigDecimal.ZERO;
        BigDecimal donGiaNuoc = bangGia != null && bangGia.getWaterPrice() != null
                ? bangGia.getWaterPrice()
                : BigDecimal.ZERO;

        int dungDien = Math.max(0, chiSo.getNewElectric() - chiSo.getOldElectric());
        int dungNuoc = Math.max(0, chiSo.getNewWater() - chiSo.getOldWater());

        chiSo.setElectricityCost(donGiaDien.multiply(BigDecimal.valueOf(dungDien)));
        chiSo.setWaterCost(donGiaNuoc.multiply(BigDecimal.valueOf(dungNuoc)));
        chiSo.setTotalCost(chiSo.getElectricityCost().add(chiSo.getWaterCost()));

        ChiSoDienNuoc daLuu = khoChiSoDienNuoc.save(chiSo);
        tinhTienService.taoHoacCapNhatHoaDonTuChiSo(daLuu);
        return ResponseEntity.ok(daLuu);
    }
}
