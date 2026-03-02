package com.motelmanagement.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.dto.RemindRequest;
import com.motelmanagement.repository.KhoHoaDon;
import com.motelmanagement.repository.KhoKhachThue;
import com.motelmanagement.service.TinhTienService;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhacNoHoaDonService;

import lombok.RequiredArgsConstructor;

/** API hóa đơn: danh sách, tạo, cập nhật trạng thái. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/invoices")
public class HoaDonController {
    private final KhoHoaDon khoHoaDon;
    private final KhoKhachThue khoKhachThue;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;
    private final NhacNoHoaDonService nhacNoHoaDonService;
    private final TinhTienService tinhTienService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<HoaDon> layDanhSach() {
        return khoHoaDon.findAllWithTenantAndRoom();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TENANT')")
    public List<HoaDon> layHoaDonCuaToi() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return List.of();
        }
        KhachThue khachThue = khoKhachThue.findByUser_Id(nguoiDung.getId());
        if (khachThue == null) {
            return List.of();
        }
        return khoHoaDon.findByKhachThue(khachThue);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public HoaDon tao(@RequestBody HoaDon hoaDon) {
        return khoHoaDon.save(hoaDon);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<HoaDon> capNhatTrangThai(@PathVariable("id") Long ma, @RequestParam(value = "status") TrangThaiHoaDon trangThai) {
        return khoHoaDon.findById(ma)
                .map(hienTai -> {
                    hienTai.setStatus(trangThai);
                    return ResponseEntity.ok(khoHoaDon.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Chạy ngay job sinh hóa đơn cho tháng trước và tháng hiện tại (tránh đợi job định kỳ). */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<Map<String, Object>> sinhHoaDonNgay() {
        java.time.YearMonth hienTai = java.time.YearMonth.now();
        java.time.YearMonth thangTruoc = hienTai.minusMonths(1);
        int soThangTruoc = tinhTienService.sinhHoaDonChoThang(thangTruoc.getMonthValue(), thangTruoc.getYear());
        int soThangHienTai = tinhTienService.sinhHoaDonChoThang(hienTai.getMonthValue(), hienTai.getYear());
        int tong = soThangTruoc + soThangHienTai;
        return ResponseEntity.ok(Map.of(
                "message", tong > 0
                        ? "Đã sinh " + tong + " hóa đơn (tháng " + thangTruoc.getMonthValue() + "/" + thangTruoc.getYear() + ": " + soThangTruoc + ", tháng " + hienTai.getMonthValue() + "/" + hienTai.getYear() + ": " + soThangHienTai + ")."
                        : "Không có hóa đơn mới (đã đủ hoặc không có hợp đồng active).",
                "created", tong
        ));
    }

    @PostMapping("/{id}/remind")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> guiNhacNo(@PathVariable("id") Long ma, @RequestBody RemindRequest yeuCau) {
        String kenh = yeuCau != null && yeuCau.getChannel() != null ? yeuCau.getChannel().trim() : "";
        java.util.Optional<String> loi = nhacNoHoaDonService.guiNhacNo(ma, kenh);
        if (loi.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", loi.get()));
        }
        return ResponseEntity.ok(Map.of("message", "Đã gửi nhắc nợ thành công."));
    }
}
