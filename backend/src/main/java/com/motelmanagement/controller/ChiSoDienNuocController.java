package com.motelmanagement.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.motelmanagement.domain.BangGiaDichVu;
import com.motelmanagement.domain.ChiSoDienNuoc;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.dto.YeuCauCapNhatChiSoDienNuoc;
import com.motelmanagement.repository.BangGiaDichVuRepository;
import com.motelmanagement.repository.ChiSoDienNuocRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.service.FileLuuTruService;
import com.motelmanagement.service.TinhTienService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chi-so-dien-nuoc")
public class ChiSoDienNuocController {
    private final ChiSoDienNuocRepository chiSoDienNuocRepository;
    private final PhongRepository phongRepository;
    private final BangGiaDichVuRepository bangGiaDichVuRepository;
    private final TinhTienService tinhTienService;
    private final FileLuuTruService fileLuuTruService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<ChiSoDienNuoc> layDanhSach() {
        List<ChiSoDienNuoc> tatCa = chiSoDienNuocRepository.findAll();
        for (ChiSoDienNuoc c : tatCa) {
            ganChiSoCuHienThi(c);
        }
        return tatCa;
    }

    private void ganChiSoCuHienThi(ChiSoDienNuoc c) {
        c.setDienCu(tinhTienService.layChiSoDienCuTheoKy(c));
        c.setNuocCu(tinhTienService.layChiSoNuocCuTheoKy(c));
    }


    private static boolean choPhepThang(int thang, int nam) {
        YearMonth hienTai = YearMonth.now();
        YearMonth kyChiSo = YearMonth.of(nam, thang);
        return kyChiSo.equals(hienTai) || kyChiSo.equals(hienTai.minusMonths(1));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ChiSoDienNuoc> tao(@RequestBody ChiSoDienNuoc chiSo) {
        chiSo.setId(null);
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
        if (!tinhTienService.phongCoHopDongActiveChoKy(phong.getId(), chiSo.getThang(), chiSo.getNam())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chỉ được nhập chỉ số cho phòng đang có hợp đồng hiệu lực trong kỳ tháng/năm đã chọn.");
        }
        chiSo.setPhong(phong);

        tinhLaiTienDienNuoc(chiSo);

        ChiSoDienNuoc daLuu = chiSoDienNuocRepository.save(chiSo);
        tinhTienService.taoHoacCapNhatHoaDonTuChiSo(daLuu);
        ganChiSoCuHienThi(daLuu);
        return ResponseEntity.ok(daLuu);
    }


    @PostMapping(value = "/{id}/anh", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ChiSoDienNuoc> taiAnhDongHo(
            @PathVariable("id") String id,
            @RequestParam("file") MultipartFile file) {
        return chiSoDienNuocRepository.findById(id)
                .map(hienTai -> {
                    String duongDan = fileLuuTruService.luuAnh(file, "meters");
                    hienTai.setAnhDongHo(duongDan);
                    ChiSoDienNuoc daLuu = chiSoDienNuocRepository.save(hienTai);
                    ganChiSoCuHienThi(daLuu);
                    return ResponseEntity.ok(daLuu);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ChiSoDienNuoc> capNhat(
            @PathVariable("id") String id,
            @RequestBody YeuCauCapNhatChiSoDienNuoc dto) {
        Optional<ChiSoDienNuoc> opt = chiSoDienNuocRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.<ChiSoDienNuoc>notFound().build();
        }
        ChiSoDienNuoc hienTai = opt.get();
        if (!choPhepThang(hienTai.getThang(), hienTai.getNam())) {
            return ResponseEntity.<ChiSoDienNuoc>badRequest().build();
        }
        hienTai.setDienMoi(dto.getDienMoi());
        hienTai.setNuocMoi(dto.getNuocMoi());
        tinhLaiTienDienNuoc(hienTai);
        ChiSoDienNuoc daLuu = chiSoDienNuocRepository.save(hienTai);
        tinhTienService.taoHoacCapNhatHoaDonTuChiSo(daLuu);
        ganChiSoCuHienThi(daLuu);
        return ResponseEntity.ok(daLuu);
    }

    private void tinhLaiTienDienNuoc(ChiSoDienNuoc chiSo) {
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

        int dienCu = tinhTienService.layChiSoDienCuTheoKy(chiSo);
        int nuocCu = tinhTienService.layChiSoNuocCuTheoKy(chiSo);
        chiSo.setDienCu(dienCu);
        chiSo.setNuocCu(nuocCu);

        int dungDien = Math.max(0, chiSo.getDienMoi() - dienCu);
        int dungNuoc = Math.max(0, chiSo.getNuocMoi() - nuocCu);

        chiSo.setTienDien(donGiaDien.multiply(BigDecimal.valueOf(dungDien)));
        chiSo.setTienNuoc(donGiaNuoc.multiply(BigDecimal.valueOf(dungNuoc)));
    }
}
