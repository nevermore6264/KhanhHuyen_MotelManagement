package com.motelmanagement.controller;

import java.util.LinkedHashMap;
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
import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.HopDongThanhVien;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.dto.HoaDonResponseDto;
import com.motelmanagement.dto.KhachThueTomTatDto;
import com.motelmanagement.dto.RemindRequest;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhacNoHoaDonService;
import com.motelmanagement.service.TinhTienService;

import lombok.RequiredArgsConstructor;

/** API hóa đơn: danh sách, tạo, cập nhật trạng thái. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/hoa-don")
public class HoaDonController {
    private final HoaDonRepository hoaDonRepository;
    private final HopDongRepository hopDongRepository;
    private final KhachThueRepository khachThueRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;
    private final NhacNoHoaDonService nhacNoHoaDonService;
    private final TinhTienService tinhTienService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<HoaDonResponseDto> layDanhSach() {
        return hoaDonRepository.findAllWithTenantAndRoom().stream()
                .map(this::xuongDto)
                .toList();
    }

    @GetMapping("/cua-toi")
    @PreAuthorize("hasRole('TENANT')")
    public List<HoaDonResponseDto> layHoaDonCuaToi() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            return List.of();
        }
        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        if (khachThue == null) {
            return List.of();
        }
        return hoaDonRepository.findByKhachThue(khachThue).stream()
                .map(this::xuongDto)
                .toList();
    }

    private HoaDonResponseDto xuongDto(HoaDon h) {
        Long maPhong = h.getPhong() != null ? h.getPhong().getId() : null;
        List<KhachThueTomTatDto> ds = layDanhSachKhachTheoPhong(maPhong, h.getKhachThue());
        return HoaDonResponseDto.tu(h, ds);
    }

    /**
     * Khách hiển thị trên hóa đơn: đại diện + thành viên hợp đồng ACTIVE của phòng;
     * nếu không có hợp đồng / không có thành viên thì dùng khách ghi trên hóa đơn.
     */
    private List<KhachThueTomTatDto> layDanhSachKhachTheoPhong(Long maPhong, KhachThue fallback) {
        if (maPhong == null) {
            return fallback != null ? List.of(KhachThueTomTatDto.tu(fallback)) : List.of();
        }
        return hopDongRepository.findByPhong_IdAndTrangThai(maPhong, TrangThaiHopDong.ACTIVE)
                .map(hd -> {
                    LinkedHashMap<Long, KhachThue> gom = new LinkedHashMap<>();
                    if (hd.getKhachThue() != null) {
                        gom.put(hd.getKhachThue().getId(), hd.getKhachThue());
                    }
                    if (hd.getThanhVien() != null) {
                        for (HopDongThanhVien tv : hd.getThanhVien()) {
                            if (tv.getKhachThue() != null) {
                                gom.putIfAbsent(tv.getKhachThue().getId(), tv.getKhachThue());
                            }
                        }
                    }
                    return gom.values().stream().map(KhachThueTomTatDto::tu).toList();
                })
                .filter(list -> !list.isEmpty())
                .orElseGet(() -> fallback != null ? List.of(KhachThueTomTatDto.tu(fallback)) : List.of());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public HoaDon tao(@RequestBody HoaDon hoaDon) {
        return hoaDonRepository.save(hoaDon);
    }

    @PutMapping("/{id}/trang-thai")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<HoaDon> capNhatTrangThai(@PathVariable("id") Long ma, @RequestParam(value = "status") TrangThaiHoaDon trangThai) {
        return hoaDonRepository.findById(ma)
                .map(hienTai -> {
                    hienTai.setTrangThai(trangThai);
                    return ResponseEntity.ok(hoaDonRepository.save(hienTai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Chạy ngay job sinh hóa đơn cho tháng trước và tháng hiện tại (tránh đợi job định kỳ). */
    @PostMapping("/sinh")
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

    @PostMapping("/{id}/nhac-no")
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
