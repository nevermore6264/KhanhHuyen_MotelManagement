package com.motelmanagement.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.PhuongThucThanhToan;
import com.motelmanagement.domain.ThanhToan;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.dto.GhiNhanThanhToanRequest;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.ThanhToanRepository;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.PayOSService;
import com.motelmanagement.service.TinhTienService;

import lombok.RequiredArgsConstructor;

/** API thanh toán: PayOS, lịch sử thanh toán theo khách thuê. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/thanh-toan")
public class ThanhToanController {
    private final ThanhToanRepository thanhToanRepository;
    private final HoaDonRepository hoaDonRepository;
    private final KhachThueRepository khachThueRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;
    private final PayOSService payOSService;
    private final TinhTienService tinhTienService;

    @GetMapping("/cua-toi")
    @PreAuthorize("hasRole('TENANT')")
    public List<ThanhToan> layThanhToanGanDayCuaToi(
            @RequestParam(value = "gioiHan", defaultValue = "10") int gioiHan) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) return List.of();
        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        if (khachThue == null) return List.of();
        int kichThuoc = Math.min(Math.max(1, gioiHan), 50);
        return thanhToanRepository.findByHoaDon_KhachThue_IdOrderByThoiGianThanhToanDesc(
                khachThue.getId(), PageRequest.of(0, kichThuoc));
    }

    @GetMapping("/hoa-don/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public List<ThanhToan> layTheoHoaDon(@PathVariable("invoiceId") Long maHoaDon) {
        return thanhToanRepository.findByHoaDonId(maHoaDon);
    }

    /** Tạo link thanh toán PayOS (tenant chỉ được tạo cho hóa đơn của mình). */
    @PostMapping("/tao-link")
    @PreAuthorize("hasRole('TENANT')")
    public ResponseEntity<Map<String, String>> taoLinkThanhToan(@RequestBody Map<String, Object> body) {
        Object idObj = body != null ? body.get("invoiceId") : null;
        if (idObj == null) return ResponseEntity.badRequest().build();
        long maHoaDon;
        if (idObj instanceof Number) {
            maHoaDon = ((Number) idObj).longValue();
        } else {
            try {
                maHoaDon = Long.parseLong(idObj.toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) return ResponseEntity.status(403).build();
        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        if (khachThue == null) return ResponseEntity.status(403).build();
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon).orElse(null);
        hoaDon = tinhTienService.tinhTienRuntime(hoaDon);
        if (hoaDon == null || hoaDon.getKhachThue() == null
                || !hoaDon.getKhachThue().getId().equals(khachThue.getId())) {
            return ResponseEntity.status(403).build();
        }
        String linkThanhToan = payOSService.taoLinkThanhToan(hoaDon);
        if (linkThanhToan == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(Map.of("paymentUrl", linkThanhToan));
    }

    /**
     * Kiểm tra URL webhook (GET trong trình duyệt). PayOS thực tế gửi POST JSON — không gọi từ frontend Next.js.
     * Nếu cấu hình nhầm port 4002 hoặc thiếu {@code /api} thì webhook không tới backend.
     */
    @GetMapping("/payos/webhook")
    public ResponseEntity<Map<String, String>> webhookPayOSThongTin() {
        return ResponseEntity.ok(Map.of(
                "endpoint", "PayOS webhook",
                "method", "POST JSON từ máy chủ PayOS",
                "path", "/api/thanh-toan/payos/webhook",
                "backend", "http://<host>:8080 (Spring), không phải port frontend Next.js",
                "ghiChu", "CORS không áp dụng cho POST từ PayOS → BE; lỗi CORS thường do gọi nhầm URL từ trình duyệt."));
    }

    /** Webhook PayOS gửi kết quả thanh toán. Cho phép không đăng nhập. */
    @PostMapping("/payos/webhook")
    public ResponseEntity<Void> webhookPayOS(@RequestBody String body) {
        boolean thanhCong = payOSService.xacThucVaXuLyWebhook(body);
        return thanhCong ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<?> ghiNhanThanhToan(@RequestBody GhiNhanThanhToanRequest yeuCau) {
        if (yeuCau == null || yeuCau.getInvoiceId() == null || yeuCau.getAmount() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Thiếu mã hóa đơn hoặc số tiền."));
        }
        BigDecimal soTien = yeuCau.getAmount().setScale(0, RoundingMode.HALF_UP);
        if (soTien.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Số tiền phải lớn hơn 0."));
        }
        HoaDon hoaDon = hoaDonRepository.findById(yeuCau.getInvoiceId()).orElse(null);
        hoaDon = tinhTienService.tinhTienRuntime(hoaDon);
        if (hoaDon == null || hoaDon.getTongTien() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không tìm thấy hóa đơn."));
        }
        if (hoaDon.getTrangThai() == TrangThaiHoaDon.PAID) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hóa đơn đã thanh toán đủ."));
        }
        BigDecimal daThu = thanhToanRepository.findByHoaDonId(hoaDon.getId()).stream()
                .map(ThanhToan::getSoTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal conLai = hoaDon.getTongTien().subtract(daThu);
        if (conLai.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Không còn số tiền cần thu."));
        }
        if (soTien.compareTo(conLai) > 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message",
                    "Số tiền vượt quá phần còn lại (" + conLai.toPlainString() + " VNĐ)."));
        }
        PhuongThucThanhToan phuongThuc = chuyenPhuongThuc(yeuCau.getMethod());
        ThanhToan thanhToan = new ThanhToan();
        thanhToan.setHoaDon(hoaDon);
        thanhToan.setSoTien(soTien);
        thanhToan.setPhuongThuc(phuongThuc);
        ThanhToan daLuu = thanhToanRepository.save(thanhToan);

        BigDecimal tongSau = daThu.add(soTien);
        if (tongSau.compareTo(hoaDon.getTongTien()) >= 0) {
            hoaDon.setTrangThai(TrangThaiHoaDon.PAID);
        } else {
            hoaDon.setTrangThai(TrangThaiHoaDon.PARTIAL);
        }
        hoaDonRepository.save(hoaDon);
        return ResponseEntity.ok(daLuu);
    }

    private static PhuongThucThanhToan chuyenPhuongThuc(String method) {
        if (method == null || method.isBlank()) {
            return PhuongThucThanhToan.CASH;
        }
        try {
            return PhuongThucThanhToan.valueOf(method.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PhuongThucThanhToan.CASH;
        }
    }
}
