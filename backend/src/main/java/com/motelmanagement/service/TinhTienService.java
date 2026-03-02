package com.motelmanagement.service;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.motelmanagement.domain.ChiSoDienNuoc;
import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.repository.KhoHopDong;
import com.motelmanagement.repository.KhoHoaDon;
import com.motelmanagement.repository.KhoChiSoDienNuoc;

import lombok.RequiredArgsConstructor;

/** Dịch vụ tính tiền: tạo hóa đơn, cập nhật số điện/nước từ chỉ số. */
@Service
@RequiredArgsConstructor
public class TinhTienService {
    private static final Logger log = LoggerFactory.getLogger(TinhTienService.class);

    private final KhoHoaDon khoHoaDon;
    private final KhoHopDong khoHopDong;
    private final KhoChiSoDienNuoc khoChiSoDienNuoc;

    public HoaDon taoHoacCapNhatHoaDonTuChiSo(ChiSoDienNuoc chiSo) {
        HoaDon hoaDon = khoHoaDon
                .findByPhong_IdAndMonthAndYear(chiSo.getPhong().getId(), chiSo.getMonth(), chiSo.getYear())
                .orElseGet(HoaDon::new);

        hoaDon.setPhong(chiSo.getPhong());
        hoaDon.setMonth(chiSo.getMonth());
        hoaDon.setYear(chiSo.getYear());

        // Giá phòng lấy theo từng phòng (Phong.currentPrice), không dùng bảng giá dịch vụ
        BigDecimal giaPhong = chiSo.getPhong().getCurrentPrice() != null
                ? chiSo.getPhong().getCurrentPrice() : BigDecimal.ZERO;
        hoaDon.setRoomCost(giaPhong);
        hoaDon.setElectricityCost(chiSo.getElectricityCost());
        hoaDon.setWaterCost(chiSo.getWaterCost());

        BigDecimal tong = giaPhong
                .add(chiSo.getElectricityCost() != null ? chiSo.getElectricityCost() : BigDecimal.ZERO)
                .add(chiSo.getWaterCost() != null ? chiSo.getWaterCost() : BigDecimal.ZERO);
        hoaDon.setTotal(tong);

        HopDong hopDongHoatDong = khoHopDong.findByStatus(TrangThaiHopDong.ACTIVE).stream()
                .filter(hd -> hd.getPhong().getId().equals(chiSo.getPhong().getId()))
                .findFirst()
                .orElse(null);
        if (hopDongHoatDong != null) {
            hoaDon.setKhachThue(hopDongHoatDong.getKhachThue());
        }
        return khoHoaDon.save(hoaDon);
    }

    /**
     * Job tự động: sinh hóa đơn cho tất cả phòng có hợp đồng ACTIVE trong tháng/năm chỉ định.
     * Nếu đã có hóa đơn (room, month, year) thì bỏ qua. Tiền phòng lấy từ Phong.currentPrice,
     * tiền điện/nước lấy từ ChiSoDienNuoc nếu có, không có thì 0.
     */
    public int sinhHoaDonChoThang(int thang, int nam) {
        List<HopDong> danhSachHopDong = khoHopDong.findByStatus(TrangThaiHopDong.ACTIVE);
        int soTao = 0;
        for (HopDong hopDong : danhSachHopDong) {
            if (hopDong.getPhong() == null) continue;
            Long maPhong = hopDong.getPhong().getId();
            if (khoHoaDon.findByPhong_IdAndMonthAndYear(maPhong, thang, nam).isPresent()) {
                continue;
            }
            HoaDon hoaDon = new HoaDon();
            hoaDon.setPhong(hopDong.getPhong());
            hoaDon.setKhachThue(hopDong.getKhachThue());
            hoaDon.setMonth(thang);
            hoaDon.setYear(nam);
            hoaDon.setStatus(TrangThaiHoaDon.UNPAID);

            BigDecimal giaPhong = hopDong.getPhong().getCurrentPrice() != null
                    ? hopDong.getPhong().getCurrentPrice() : BigDecimal.ZERO;
            hoaDon.setRoomCost(giaPhong);

            hoaDon.setElectricityCost(BigDecimal.ZERO);
            hoaDon.setWaterCost(BigDecimal.ZERO);
            khoChiSoDienNuoc.findByPhongAndMonthAndYear(hopDong.getPhong(), thang, nam)
                    .ifPresent(chiSo -> {
                        if (chiSo.getElectricityCost() != null) {
                            hoaDon.setElectricityCost(chiSo.getElectricityCost());
                        }
                        if (chiSo.getWaterCost() != null) {
                            hoaDon.setWaterCost(chiSo.getWaterCost());
                        }
                    });

            BigDecimal tong = giaPhong
                    .add(hoaDon.getElectricityCost())
                    .add(hoaDon.getWaterCost());
            hoaDon.setTotal(tong);
            khoHoaDon.save(hoaDon);
            soTao++;
        }
        if (soTao > 0) {
            log.info("Invoice job: generated {} invoice(s) for {}/{}", soTao, thang, nam);
        }
        return soTao;
    }
}
