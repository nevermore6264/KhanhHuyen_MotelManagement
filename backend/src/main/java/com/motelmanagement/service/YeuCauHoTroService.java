package com.motelmanagement.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.Phong;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.domain.YeuCauHoTro;
import com.motelmanagement.repository.HopDongRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class YeuCauHoTroService {
    private final HopDongRepository hopDongRepository;


    public void ganPhongNeuThieu(YeuCauHoTro yeuCau) {
        if (yeuCau == null || yeuCau.getPhong() != null || yeuCau.getKhachThue() == null) {
            return;
        }
        String khachId = yeuCau.getKhachThue().getId();
        if (khachId == null || khachId.isBlank()) {
            return;
        }
        Phong phong = layPhongTuHopDongActive(khachId);
        if (phong != null) {
            yeuCau.setPhong(phong);
        }
    }


    public void boSungPhongTuHopDong(List<YeuCauHoTro> danhSach) {
        if (danhSach == null || danhSach.isEmpty()) {
            return;
        }
        Map<String, Phong> phongTheoKhach = new HashMap<>();
        for (YeuCauHoTro yeuCau : danhSach) {
            if (yeuCau == null || yeuCau.getPhong() != null || yeuCau.getKhachThue() == null) {
                continue;
            }
            String khachId = yeuCau.getKhachThue().getId();
            if (khachId == null || khachId.isBlank()) {
                continue;
            }
            Phong phong = phongTheoKhach.computeIfAbsent(khachId, this::layPhongTuHopDongActive);
            if (phong != null) {
                yeuCau.setPhong(phong);
            }
        }
    }

    public Phong layPhongTuHopDongActive(String khachThueId) {
        if (khachThueId == null || khachThueId.isBlank()) {
            return null;
        }
        return hopDongRepository.findThuocKhachThueCoPhong(khachThueId).stream()
                .filter(h -> h.getTrangThai() == TrangThaiHopDong.ACTIVE && h.getPhong() != null)
                .map(HopDong::getPhong)
                .findFirst()
                .orElse(null);
    }
}
