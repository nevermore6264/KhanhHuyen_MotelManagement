package com.motelmanagement.controller;

import java.math.BigDecimal;
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
import com.motelmanagement.domain.ThanhToan;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.ThanhToanRepository;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.PayOSService;

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

    @GetMapping("/cua-toi")
    @PreAuthorize("hasRole('TENANT')")
    public List<ThanhToan> layThanhToanGanDayCuaToi(@RequestParam(defaultValue = "10") int gioiHan) {
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
        if (hoaDon == null || !hoaDon.getKhachThue().getId().equals(khachThue.getId())) {
            return ResponseEntity.status(403).build();
        }
        String linkThanhToan = payOSService.taoLinkThanhToan(hoaDon);
        if (linkThanhToan == null) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(Map.of("paymentUrl", linkThanhToan));
    }

    /** Webhook PayOS gửi kết quả thanh toán. Cho phép không đăng nhập. */
    @PostMapping("/payos/webhook")
    public ResponseEntity<Void> webhookPayOS(@RequestBody String body) {
        boolean thanhCong = payOSService.xacThucVaXuLyWebhook(body);
        return thanhCong ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ThanhToan> tao(@RequestBody ThanhToan thanhToan) {
        if (thanhToan.getHoaDon() == null || thanhToan.getHoaDon().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        HoaDon hoaDon = hoaDonRepository.findById(thanhToan.getHoaDon().getId()).orElse(null);
        if (hoaDon == null) {
            return ResponseEntity.badRequest().build();
        }
        thanhToan.setHoaDon(hoaDon);
        ThanhToan daLuu = thanhToanRepository.save(thanhToan);

        BigDecimal tongDaThanhToan = thanhToanRepository.findByHoaDonId(hoaDon.getId()).stream()
                .map(ThanhToan::getSoTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (tongDaThanhToan.compareTo(hoaDon.getTongTien()) >= 0) {
            hoaDon.setTrangThai(TrangThaiHoaDon.PAID);
        } else if (tongDaThanhToan.compareTo(BigDecimal.ZERO) > 0) {
            hoaDon.setTrangThai(TrangThaiHoaDon.PARTIAL);
        }
        hoaDonRepository.save(hoaDon);
        return ResponseEntity.ok(daLuu);
    }
}
