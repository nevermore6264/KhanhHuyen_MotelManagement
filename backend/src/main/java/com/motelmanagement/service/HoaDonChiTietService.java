package com.motelmanagement.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.HoaDonChiTiet;
import com.motelmanagement.dto.YeuCauLuuChiTietHoaDon;
import com.motelmanagement.repository.HoaDonChiTietRepository;
import com.motelmanagement.repository.HoaDonRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HoaDonChiTietService {
    private final HoaDonRepository hoaDonRepository;
    private final HoaDonChiTietRepository hoaDonChiTietRepository;

    @Transactional
    public void luuChiTiet(String maHoaDon, YeuCauLuuChiTietHoaDon yeuCau) {
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy hóa đơn."));
        hoaDonChiTietRepository.deleteByHoaDon_Id(maHoaDon);
        if (yeuCau == null || yeuCau.getDong() == null) {
            return;
        }
        int thuTu = 0;
        List<HoaDonChiTiet> luu = new ArrayList<>();
        for (YeuCauLuuChiTietHoaDon.Dong d : yeuCau.getDong()) {
            if (d == null || d.getTenKhoan() == null || d.getTenKhoan().isBlank()) {
                continue;
            }
            if (d.getSoTien() == null || d.getSoTien().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            HoaDonChiTiet ct = new HoaDonChiTiet();
            ct.setHoaDon(hoaDon);
            ct.setTenKhoan(d.getTenKhoan().trim());
            ct.setSoTien(d.getSoTien().setScale(0, java.math.RoundingMode.HALF_UP));
            ct.setThuTu(thuTu++);
            luu.add(ct);
        }
        hoaDonChiTietRepository.saveAll(luu);
    }
}
