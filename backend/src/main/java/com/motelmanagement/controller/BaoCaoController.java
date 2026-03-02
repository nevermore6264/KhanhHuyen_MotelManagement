package com.motelmanagement.controller;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.domain.TrangThaiPhong;
import com.motelmanagement.repository.KhoHoaDon;
import com.motelmanagement.repository.KhoPhong;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/** API báo cáo: doanh thu, công nợ. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class BaoCaoController {
    private final KhoHoaDon khoHoaDon;
    private final KhoPhong khoPhong;

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> doanhThu(@RequestParam("month") int thang, @RequestParam("year") int nam) {
        Double doanhThu = khoHoaDon.sumRevenueByMonth(thang, nam);
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("month", thang);
        ketQua.put("year", nam);
        ketQua.put("revenue", doanhThu == null ? 0 : doanhThu);
        return ketQua;
    }

    @GetMapping("/revenue-year")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> doanhThuTheoNam(@RequestParam("year") int nam) {
        List<Object[]> hang = khoHoaDon.sumRevenueByMonthForYear(nam);
        Map<Integer, Double> theoThang = new HashMap<>();
        for (int t = 1; t <= 12; t++) {
            theoThang.put(t, 0.0);
        }
        for (Object[] row : hang) {
            Integer thang = ((Number) row[0]).intValue();
            double tong = 0.0;
            if (row[1] != null) {
                tong = row[1] instanceof BigDecimal ? ((BigDecimal) row[1]).doubleValue() : ((Number) row[1]).doubleValue();
            }
            theoThang.put(thang, tong);
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

    @GetMapping("/vacant")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> phongTrong() {
        List<Phong> danhSachPhong = khoPhong.findByStatus(TrangThaiPhong.AVAILABLE);
        List<Map<String, Object>> danhSach = danhSachPhong.stream().map(phong -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", phong.getId());
            m.put("code", phong.getCode());
            m.put("areaName", phong.getKhuVuc() != null ? phong.getKhuVuc().getName() : null);
            m.put("currentPrice", phong.getCurrentPrice());
            return m;
        }).collect(Collectors.toList());
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("vacantRooms", danhSachPhong.size());
        ketQua.put("rooms", danhSach);
        return ketQua;
    }

    @GetMapping("/debt")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> congNo() {
        List<HoaDon> chuaThanhToan = khoHoaDon.findByStatus(TrangThaiHoaDon.UNPAID);
        BigDecimal tongNo = chuaThanhToan.stream()
                .map(HoaDon::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("totalDebt", tongNo);
        ketQua.put("count", chuaThanhToan.size());
        return ketQua;
    }

    @GetMapping("/debt-detail")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> chiTietCongNo() {
        List<HoaDon> chuaThanhToan = khoHoaDon.findByStatusWithRoomAndTenant(TrangThaiHoaDon.UNPAID);
        List<Map<String, Object>> danhSach = chuaThanhToan.stream().map(hoaDon -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", hoaDon.getId());
            m.put("roomCode", hoaDon.getPhong() != null ? hoaDon.getPhong().getCode() : null);
            m.put("tenantName", hoaDon.getKhachThue() != null ? hoaDon.getKhachThue().getFullName() : null);
            m.put("month", hoaDon.getMonth());
            m.put("year", hoaDon.getYear());
            m.put("total", hoaDon.getTotal());
            m.put("status", hoaDon.getStatus() != null ? hoaDon.getStatus().name() : null);
            return m;
        }).collect(Collectors.toList());
        BigDecimal tongNo = chuaThanhToan.stream()
                .map(HoaDon::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("totalDebt", tongNo);
        ketQua.put("count", chuaThanhToan.size());
        ketQua.put("invoices", danhSach);
        return ketQua;
    }

    @GetMapping("/occupancy")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> tyLeLapDay() {
        List<Phong> tatCaPhong = khoPhong.findAll();
        long tong = tatCaPhong.size();
        long trong = khoPhong.findByStatus(TrangThaiPhong.AVAILABLE).size();
        long dangThue = khoPhong.findByStatus(TrangThaiPhong.OCCUPIED).size();
        long baoTri = khoPhong.findByStatus(TrangThaiPhong.MAINTENANCE).size();
        double tyLe = tong > 0 ? (dangThue * 100.0 / tong) : 0;
        Map<String, Object> ketQua = new HashMap<>();
        ketQua.put("totalRooms", tong);
        ketQua.put("available", trong);
        ketQua.put("occupied", dangThue);
        ketQua.put("maintenance", baoTri);
        ketQua.put("occupancyRatePercent", Math.round(tyLe * 10) / 10.0);
        return ketQua;
    }

    @GetMapping("/invoice-summary")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> tomTatHoaDon(
            @RequestParam("month") int thang,
            @RequestParam("year") int nam) {
        List<HoaDon> danhSach = khoHoaDon.findByMonthAndYear(thang, nam);
        long soDaThanhToan = danhSach.stream().filter(hd -> hd.getStatus() == TrangThaiHoaDon.PAID).count();
        long soChuaThanhToan = danhSach.stream().filter(hd -> hd.getStatus() == TrangThaiHoaDon.UNPAID).count();
        long soThanhToanMotPhan = danhSach.stream().filter(hd -> hd.getStatus() == TrangThaiHoaDon.PARTIAL).count();
        BigDecimal tongDaThanhToan = danhSach.stream()
                .filter(hd -> hd.getStatus() == TrangThaiHoaDon.PAID)
                .map(HoaDon::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tongChuaThanhToan = danhSach.stream()
                .filter(hd -> hd.getStatus() == TrangThaiHoaDon.UNPAID)
                .map(HoaDon::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tongThanhToanMotPhan = danhSach.stream()
                .filter(hd -> hd.getStatus() == TrangThaiHoaDon.PARTIAL)
                .map(HoaDon::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal tongTatCa = danhSach.stream()
                .map(HoaDon::getTotal)
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

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public Map<String, Object> tomTat(
            @RequestParam(value = "month", required = false) Integer thang,
            @RequestParam(value = "year", required = false) Integer nam) {
        Map<String, Object> ketQua = new HashMap<>();
        int namHienTai = nam != null ? nam : java.time.Year.now().getValue();
        int thangHienTai = thang != null ? thang : java.time.YearMonth.now().getMonthValue();
        Double doanhThu = khoHoaDon.sumRevenueByMonth(thangHienTai, namHienTai);
        ketQua.put("revenueMonth", doanhThu != null ? doanhThu : 0);
        ketQua.put("month", thangHienTai);
        ketQua.put("year", namHienTai);
        long phongTrong = khoPhong.findByStatus(TrangThaiPhong.AVAILABLE).size();
        ketQua.put("vacantRooms", phongTrong);
        List<HoaDon> chuaThanhToan = khoHoaDon.findByStatus(TrangThaiHoaDon.UNPAID);
        BigDecimal tongNo = chuaThanhToan.stream()
                .map(HoaDon::getTotal)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        ketQua.put("totalDebt", tongNo);
        ketQua.put("unpaidCount", chuaThanhToan.size());
        ketQua.put("totalRooms", khoPhong.count());
        ketQua.put("occupiedRooms", khoPhong.findByStatus(TrangThaiPhong.OCCUPIED).size());
        return ketQua;
    }
}
