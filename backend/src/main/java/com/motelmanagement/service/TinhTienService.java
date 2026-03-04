package com.motelmanagement.service;

import java.math.BigDecimal;
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

        HopDong hopDongHoatDong = hopDongRepository.findByTrangThai(TrangThaiHopDong.ACTIVE).stream()
                .filter(hd -> hd.getPhong().getId().equals(chiSo.getPhong().getId()))
                .findFirst()
                .orElse(null);
        if (hopDongHoatDong != null) {
            hoaDon.setKhachThue(hopDongHoatDong.getKhachThue());
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
