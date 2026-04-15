package com.motelmanagement.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.motelmanagement.domain.ChiSoDienNuoc;
import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.repository.ChiSoDienNuocRepository;
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

    public HoaDon taoHoacCapNhatHoaDonTuChiSo(ChiSoDienNuoc chiSo) {
        HoaDon hoaDon = hoaDonRepository
                .findByPhong_IdAndThangAndNam(chiSo.getPhong().getId(), chiSo.getThang(), chiSo.getNam())
                .orElseGet(HoaDon::new);

        hoaDon.setPhong(chiSo.getPhong());
        hoaDon.setThang(chiSo.getThang());
        hoaDon.setNam(chiSo.getNam());

        // Giá phòng lấy theo từng phòng (Phong.giaHienTai), không dùng bảng giá dịch vụ
        BigDecimal giaPhong = chiSo.getPhong().getGiaHienTai() != null
                ? chiSo.getPhong().getGiaHienTai() : BigDecimal.ZERO;
        hoaDon.setTienPhong(giaPhong);
        hoaDon.setTienDien(chiSo.getTienDien());
        hoaDon.setTienNuoc(chiSo.getTienNuoc());

        BigDecimal tong = giaPhong
                .add(chiSo.getTienDien() != null ? chiSo.getTienDien() : BigDecimal.ZERO)
                .add(chiSo.getTienNuoc() != null ? chiSo.getTienNuoc() : BigDecimal.ZERO);
        hoaDon.setTongTien(tong);

        HopDong hopDongHoatDong = hopDongRepository
                .findByPhong_IdAndTrangThai(chiSo.getPhong().getId(), TrangThaiHopDong.ACTIVE)
                .orElse(null);
        if (hopDongHoatDong != null
                && hopDongCoHieuLucTrongThang(hopDongHoatDong, chiSo.getThang(), chiSo.getNam())) {
            hoaDon.setKhachThue(hopDongHoatDong.getKhachThue());
        } else {
            hoaDon.setKhachThue(null);
        }
        return hoaDonRepository.save(hoaDon);
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

            BigDecimal giaPhong = hopDong.getPhong().getGiaHienTai() != null
                    ? hopDong.getPhong().getGiaHienTai() : BigDecimal.ZERO;
            hoaDon.setTienPhong(giaPhong);

            hoaDon.setTienDien(BigDecimal.ZERO);
            hoaDon.setTienNuoc(BigDecimal.ZERO);
            chiSoDienNuocRepository.findByPhongAndThangAndNam(hopDong.getPhong(), thang, nam)
                    .ifPresent(chiSo -> {
                        if (chiSo.getTienDien() != null) {
                            hoaDon.setTienDien(chiSo.getTienDien());
                        }
                        if (chiSo.getTienNuoc() != null) {
                            hoaDon.setTienNuoc(chiSo.getTienNuoc());
                        }
                    });

            BigDecimal tong = giaPhong
                    .add(hoaDon.getTienDien())
                    .add(hoaDon.getTienNuoc());
            hoaDon.setTongTien(tong);
            hoaDonRepository.save(hoaDon);
            soTao++;
        }
        if (soTao > 0) {
            log.info("Invoice job: generated {} invoice(s) for {}/{}", soTao, thang, nam);
        }
        return soTao;
    }
}
