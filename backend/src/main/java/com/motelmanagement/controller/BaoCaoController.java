package com.motelmanagement.controller;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.domain.TrangThaiPhong;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.PhongRepository;
import com.motelmanagement.service.TinhTienService;

import lombok.RequiredArgsConstructor;

/** API báo cáo: doanh thu, công nợ. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/bao-cao")
public class BaoCaoController {
    private final HoaDonRepository hoaDonRepository;
    private final PhongRepository phongRepository;
    private final TinhTienService tinhTienService;

    private List<HoaDon> tinhTienDanhSach(List<HoaDon> ds) {
        return ds.stream().map(tinhTienService::tinhTienRuntime).toList();
    }

    @GetMapping("/doanh-thu")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> doanhThu(@RequestParam("month") int thang, @RequestParam("year") int nam) {
        BigDecimal doanhThu = tinhTienDanhSach(hoaDonRepository.findByThangAndNam(thang, nam)).stream()
                .filter(hd -> hd.getTrangThai() == TrangThaiHoaDon.PAID)
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("month", thang);
        ketQua.put("year", nam);
        ketQua.put("revenue", doanhThu);
        return ketQua;
    }

    @GetMapping("/doanh-thu-theo-nam")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> doanhThuTheoNam(@RequestParam("year") int nam) {
        List<HoaDon> danhSachNam = tinhTienDanhSach(hoaDonRepository.findAll()).stream()
                .filter(hd -> hd.getNam() == nam && hd.getTrangThai() == TrangThaiHoaDon.PAID)
                .toList();
        Map<Integer, Double> theoThang = new HashMap<>();
        for (int t = 1; t <= 12; t++) {
            theoThang.put(t, 0.0);
        }
        for (HoaDon hd : danhSachNam) {
            int thang = hd.getThang();
            double tong = hd.getTongTien() != null ? hd.getTongTien().doubleValue() : 0.0;
            theoThang.put(thang, theoThang.getOrDefault(thang, 0.0) + tong);
        }
        List<Map<String, Object>> danhSachThang = new ArrayList<>();
        for (int t = 1; t <= 12; t++) {
            Map<String, Object> muc = new HashMap<>();
            muc.put("month", t);
            muc.put("revenue", theoThang.get(t));
            danhSachThang.add(muc);
        }
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("year", nam);
        ketQua.put("months", danhSachThang);
        ketQua.put("total", danhSachThang.stream().mapToDouble(m -> ((Number) m.get("revenue")).doubleValue()).sum());
        return ketQua;
    }

    @GetMapping("/phong-trong")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> phongTrong() {
        List<Phong> danhSachPhong = phongRepository.findByTrangThai(TrangThaiPhong.AVAILABLE);
        List<Map<String, Object>> danhSach = danhSachPhong.stream().map(phong -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", phong.getId());
            m.put("code", phong.getMaPhong());
            m.put("areaName", phong.getKhuVuc() != null ? phong.getKhuVuc().getTen() : null);
            m.put("currentPrice", phong.getGiaHienTai());
            return m;
        }).collect(Collectors.toList());
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("vacantRooms", danhSachPhong.size());
        ketQua.put("rooms", danhSach);
        return ketQua;
    }

    @GetMapping("/cong-no")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> congNo() {
        List<HoaDon> chuaThanhToan = tinhTienDanhSach(hoaDonRepository.findByTrangThai(TrangThaiHoaDon.UNPAID));
        BigDecimal tongNo = chuaThanhToan.stream()
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("totalDebt", tongNo);
        ketQua.put("count", chuaThanhToan.size());
        return ketQua;
    }

    @GetMapping("/chi-tiet-cong-no")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> chiTietCongNo() {
        List<HoaDon> chuaThanhToan = tinhTienDanhSach(
                hoaDonRepository.findByTrangThaiWithRoomAndTenant(TrangThaiHoaDon.UNPAID));
        List<Map<String, Object>> danhSach = chuaThanhToan.stream().map(hoaDon -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", hoaDon.getId());
            m.put("roomCode", hoaDon.getPhong() != null ? hoaDon.getPhong().getMaPhong() : null);
            m.put("tenantName", hoaDon.getKhachThue() != null ? hoaDon.getKhachThue().getHoTen() : null);
            m.put("month", hoaDon.getThang());
            m.put("year", hoaDon.getNam());
            m.put("total", hoaDon.getTongTien());
            m.put("status", hoaDon.getTrangThai() != null ? hoaDon.getTrangThai().name() : null);
            return m;
        }).collect(Collectors.toList());
        BigDecimal tongNo = chuaThanhToan.stream()
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("totalDebt", tongNo);
        ketQua.put("count", chuaThanhToan.size());
        ketQua.put("invoices", danhSach);
        return ketQua;
    }

    @GetMapping("/ty-le-lap-day")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> tyLeLapDay() {
        List<Phong> tatCaPhong = phongRepository.findAll();
        long tong = tatCaPhong.size();
        long trong = phongRepository.findByTrangThai(TrangThaiPhong.AVAILABLE).size();
        long dangThue = phongRepository.findByTrangThai(TrangThaiPhong.OCCUPIED).size();
        long baoTri = phongRepository.findByTrangThai(TrangThaiPhong.MAINTENANCE).size();
        double tyLe = tong > 0 ? (dangThue * 100.0 / tong) : 0;
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("totalRooms", tong);
        ketQua.put("available", trong);
        ketQua.put("occupied", dangThue);
        ketQua.put("maintenance", baoTri);
        ketQua.put("occupancyRatePercent", Math.round(tyLe * 10) / 10.0);
        return ketQua;
    }

    @GetMapping("/tom-tat-hoa-don")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> tomTatHoaDon(
            @RequestParam("month") int thang,
            @RequestParam("year") int nam) {
        List<HoaDon> danhSach = tinhTienDanhSach(hoaDonRepository.findByThangAndNam(thang, nam));
        long soDaThanhToan = danhSach.stream().filter(hd -> hd.getTrangThai() == TrangThaiHoaDon.PAID).count();
        long soChuaThanhToan = danhSach.stream().filter(hd -> hd.getTrangThai() == TrangThaiHoaDon.UNPAID).count();
        long soThanhToanMotPhan = danhSach.stream().filter(hd -> hd.getTrangThai() == TrangThaiHoaDon.PARTIAL).count();
        BigDecimal tongDaThanhToan = danhSach.stream()
                .filter(hd -> hd.getTrangThai() == TrangThaiHoaDon.PAID)
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tongChuaThanhToan = danhSach.stream()
                .filter(hd -> hd.getTrangThai() == TrangThaiHoaDon.UNPAID)
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tongThanhToanMotPhan = danhSach.stream()
                .filter(hd -> hd.getTrangThai() == TrangThaiHoaDon.PARTIAL)
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tongTatCa = danhSach.stream()
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("month", thang);
        ketQua.put("year", nam);
        ketQua.put("countPaid", soDaThanhToan);
        ketQua.put("countUnpaid", soChuaThanhToan);
        ketQua.put("countPartial", soThanhToanMotPhan);
        ketQua.put("countTotal", danhSach.size());
        ketQua.put("sumPaid", tongDaThanhToan);
        ketQua.put("sumUnpaid", tongChuaThanhToan);
        ketQua.put("sumPartial", tongThanhToanMotPhan);
        ketQua.put("sumTotal", tongTatCa);
        return ketQua;
    }

    @GetMapping("/tom-tat")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> tomTat(
            @RequestParam(value = "month", required = false) Integer thang,
            @RequestParam(value = "year", required = false) Integer nam) {
        Map<String, Object> ketQua = new HashMap<>();
        int namHienTai = nam != null ? nam : java.time.Year.now().getValue();
        int thangHienTai = thang != null ? thang : java.time.YearMonth.now().getMonthValue();
        BigDecimal doanhThu = tinhTienDanhSach(hoaDonRepository.findByThangAndNam(thangHienTai, namHienTai)).stream()
                .filter(hd -> hd.getTrangThai() == TrangThaiHoaDon.PAID)
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        ketQua.put("revenueMonth", doanhThu);
        ketQua.put("month", thangHienTai);
        ketQua.put("year", namHienTai);
        long phongTrong = phongRepository.findByTrangThai(TrangThaiPhong.AVAILABLE).size();
        ketQua.put("vacantRooms", phongTrong);
        List<HoaDon> chuaThanhToan = tinhTienDanhSach(hoaDonRepository.findByTrangThai(TrangThaiHoaDon.UNPAID));
        BigDecimal tongNo = chuaThanhToan.stream()
                .map(HoaDon::getTongTien)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        ketQua.put("totalDebt", tongNo);
        ketQua.put("unpaidCount", chuaThanhToan.size());
        ketQua.put("totalRooms", phongRepository.count());
        ketQua.put("occupiedRooms", phongRepository.findByTrangThai(TrangThaiPhong.OCCUPIED).size());
        return ketQua;
    }
}
