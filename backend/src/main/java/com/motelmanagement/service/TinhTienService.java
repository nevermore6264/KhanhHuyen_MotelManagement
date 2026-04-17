package com.motelmanagement.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.motelmanagement.domain.BangGiaDichVu;
import com.motelmanagement.domain.ChiSoDienNuoc;
import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.HoaDonChiTiet;
import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.repository.BangGiaDichVuRepository;
import com.motelmanagement.repository.ChiSoDienNuocRepository;
import com.motelmanagement.repository.HoaDonChiTietRepository;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.HopDongRepository;

import lombok.RequiredArgsConstructor;

/** Dịch vụ tính tiền: tạo hóa đơn, cập nhật số điện/nước từ chỉ số. */
@Service
@RequiredArgsConstructor
public class TinhTienService {
    private static final Logger log = LoggerFactory.getLogger(TinhTienService.class);

    private final HoaDonRepository hoaDonRepository;
    private final HopDongRepository hopDongRepository;
    private final ChiSoDienNuocRepository chiSoDienNuocRepository;
    private final BangGiaDichVuRepository bangGiaDichVuRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;

    /**
     * Hóa đơn kỳ (tháng/năm) chỉ áp dụng khi hợp đồng còn hiệu lực ít nhất một ngày trong tháng đó.
     * Không có ngày bắt đầu: giữ hành vi cũ (vẫn tính có hiệu lực).
     */
    private static boolean hopDongCoHieuLucTrongThang(HopDong hopDong, int thang, int nam) {
        if (hopDong.getNgayBatDau() == null) {
            return true;
        }
        YearMonth ky = YearMonth.of(nam, thang);
        LocalDate dauKy = ky.atDay(1);
        LocalDate cuoiKy = ky.atEndOfMonth();
        if (hopDong.getNgayBatDau().isAfter(cuoiKy)) {
            return false;
        }
        if (hopDong.getNgayKetThuc() != null && hopDong.getNgayKetThuc().isBefore(dauKy)) {
            return false;
        }
        return true;
    }

    /**
     * Phòng có hợp đồng ACTIVE và kỳ tháng/năm giao với hiệu lực hợp đồng (được nhập chỉ số điện nước).
     */
    public boolean phongCoHopDongActiveChoKy(long maPhong, int thang, int nam) {
        return hopDongRepository.findByPhong_IdAndTrangThai(maPhong, TrangThaiHopDong.ACTIVE)
                .filter(hd -> hopDongCoHieuLucTrongThang(hd, thang, nam))
                .isPresent();
    }

    /** Tính động tiền hóa đơn theo phòng + chỉ số cùng kỳ. */
    public HoaDon tinhTienRuntime(HoaDon hoaDon) {
        if (hoaDon == null) {
            return null;
        }
        BigDecimal tienPhong = BigDecimal.ZERO;
        if (hoaDon.getPhong() != null && hoaDon.getPhong().getGiaHienTai() != null) {
            tienPhong = hoaDon.getPhong().getGiaHienTai();
        }
        BigDecimal tienDien = BigDecimal.ZERO;
        BigDecimal tienNuoc = BigDecimal.ZERO;
        if (hoaDon.getPhong() != null) {
            chiSoDienNuocRepository
                    .findByPhong_IdAndThangAndNam(hoaDon.getPhong().getId(), hoaDon.getThang(), hoaDon.getNam())
                    .ifPresent(chiSo -> {
                        hoaDon.setTienDien(tinhTienDienTuChiSo(chiSo));
                        hoaDon.setTienNuoc(tinhTienNuocTuChiSo(chiSo));
                    });
            tienDien = hoaDon.getTienDien() != null ? hoaDon.getTienDien() : BigDecimal.ZERO;
            tienNuoc = hoaDon.getTienNuoc() != null ? hoaDon.getTienNuoc() : BigDecimal.ZERO;
        }
        BigDecimal tienKhoanKhac = BigDecimal.ZERO;
        if (hoaDon.getId() != null && !hoaDon.getId().isBlank()) {
            tienKhoanKhac = hoaDonChiTietRepository.findByHoaDon_IdOrderByThuTuAsc(hoaDon.getId()).stream()
                    .map(HoaDonChiTiet::getSoTien)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        hoaDon.setTienPhong(tienPhong);
        hoaDon.setTienDien(tienDien);
        hoaDon.setTienNuoc(tienNuoc);
        hoaDon.setTongTien(tienPhong.add(tienDien).add(tienNuoc).add(tienKhoanKhac));
        return hoaDon;
    }

    /** Số điện đầu kỳ = số mới tháng trước (cùng phòng); không có tháng trước thì 0. */
    public int layChiSoDienCuTheoKy(ChiSoDienNuoc chiSo) {
        if (chiSo.getPhong() == null) {
            return 0;
        }
        YearMonth ky = YearMonth.of(chiSo.getNam(), chiSo.getThang()).minusMonths(1);
        return chiSoDienNuocRepository
                .findByPhong_IdAndThangAndNam(chiSo.getPhong().getId(), ky.getMonthValue(), ky.getYear())
                .map(ChiSoDienNuoc::getDienMoi)
                .orElse(0);
    }

    /** Số nước đầu kỳ = số mới tháng trước. */
    public int layChiSoNuocCuTheoKy(ChiSoDienNuoc chiSo) {
        if (chiSo.getPhong() == null) {
            return 0;
        }
        YearMonth ky = YearMonth.of(chiSo.getNam(), chiSo.getThang()).minusMonths(1);
        return chiSoDienNuocRepository
                .findByPhong_IdAndThangAndNam(chiSo.getPhong().getId(), ky.getMonthValue(), ky.getYear())
                .map(ChiSoDienNuoc::getNuocMoi)
                .orElse(0);
    }

    private BangGiaDichVu layBangGiaMoiNhat() {
        return bangGiaDichVuRepository
                .findFirstByOrderByHieuLucTuDesc()
                .orElse(null);
    }

    private BigDecimal tinhTienDienTuChiSo(ChiSoDienNuoc chiSo) {
        BangGiaDichVu bangGia = layBangGiaMoiNhat();
        BigDecimal donGiaDien = bangGia != null && bangGia.getGiaDien() != null ? bangGia.getGiaDien() : BigDecimal.ZERO;
        int dienCu = layChiSoDienCuTheoKy(chiSo);
        int sanLuong = Math.max(0, chiSo.getDienMoi() - dienCu);
        return donGiaDien.multiply(BigDecimal.valueOf(sanLuong));
    }

    private BigDecimal tinhTienNuocTuChiSo(ChiSoDienNuoc chiSo) {
        BangGiaDichVu bangGia = layBangGiaMoiNhat();
        BigDecimal donGiaNuoc = bangGia != null && bangGia.getGiaNuoc() != null ? bangGia.getGiaNuoc() : BigDecimal.ZERO;
        int nuocCu = layChiSoNuocCuTheoKy(chiSo);
        int sanLuong = Math.max(0, chiSo.getNuocMoi() - nuocCu);
        return donGiaNuoc.multiply(BigDecimal.valueOf(sanLuong));
    }

    public HoaDon taoHoacCapNhatHoaDonTuChiSo(ChiSoDienNuoc chiSo) {
        HoaDon hoaDon = hoaDonRepository
                .findByPhong_IdAndThangAndNam(chiSo.getPhong().getId(), chiSo.getThang(), chiSo.getNam())
                .orElseGet(HoaDon::new);

        hoaDon.setPhong(chiSo.getPhong());
        hoaDon.setThang(chiSo.getThang());
        hoaDon.setNam(chiSo.getNam());

        HopDong hopDongHoatDong = hopDongRepository
                .findByPhong_IdAndTrangThai(chiSo.getPhong().getId(), TrangThaiHopDong.ACTIVE)
                .orElse(null);
        if (hopDongHoatDong != null
                && hopDongCoHieuLucTrongThang(hopDongHoatDong, chiSo.getThang(), chiSo.getNam())) {
            hoaDon.setKhachThue(hopDongHoatDong.getKhachThue());
        } else {
            hoaDon.setKhachThue(null);
        }
        HoaDon daLuu = hoaDonRepository.save(hoaDon);
        return tinhTienRuntime(daLuu);
    }

    /**
     * Nếu đã có chỉ số điện nước cùng phòng/kỳ, cập nhật tiền điện/nước và tổng trên hóa đơn (tránh hiển thị 0
     * khi chỉ số nhập sau lúc sinh hóa đơn).
     */
    public HoaDon dongBoHoaDonTheoChiSoNeuCo(HoaDon hoaDon) {
        if (hoaDon.getId() == null || hoaDon.getId().isBlank() || hoaDon.getPhong() == null) {
            return hoaDon;
        }
        return tinhTienRuntime(hoaDon);
    }

    /**
     * Job tự động: sinh hóa đơn cho tất cả phòng có hợp đồng ACTIVE trong tháng/năm chỉ định.
     * Nếu đã có hóa đơn (room, month, year) thì bỏ qua. Tiền phòng lấy từ Phong.currentPrice,
     * tiền điện/nước lấy từ ChiSoDienNuoc nếu có, không có thì 0.
     */
    public int sinhHoaDonChoThang(int thang, int nam) {
        List<HopDong> danhSachHopDong = hopDongRepository.findByTrangThai(TrangThaiHopDong.ACTIVE);
        int soTao = 0;
        for (HopDong hopDong : danhSachHopDong) {
            if (hopDong.getPhong() == null) continue;
            if (!hopDongCoHieuLucTrongThang(hopDong, thang, nam)) {
                continue;
            }
            Long maPhong = hopDong.getPhong().getId();
            if (hoaDonRepository.findByPhong_IdAndThangAndNam(maPhong, thang, nam).isPresent()) {
                continue;
            }
            HoaDon hoaDon = new HoaDon();
            hoaDon.setPhong(hopDong.getPhong());
            hoaDon.setKhachThue(hopDong.getKhachThue());
            hoaDon.setThang(thang);
            hoaDon.setNam(nam);
            hoaDon.setTrangThai(TrangThaiHoaDon.UNPAID);

            hoaDonRepository.save(hoaDon);
            soTao++;
        }
        if (soTao > 0) {
            log.info("Invoice job: generated {} invoice(s) for {}/{}", soTao, thang, nam);
        }
        return soTao;
    }
}
