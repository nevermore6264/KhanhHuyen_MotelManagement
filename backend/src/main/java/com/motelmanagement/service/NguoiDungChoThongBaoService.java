package com.motelmanagement.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.dto.DtoNguoiDungChoThongBao;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.NguoiDungRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NguoiDungChoThongBaoService {
    private final NguoiDungRepository nguoiDungRepository;
    private final KhachThueRepository khachThueRepository;
    private final HopDongRepository hopDongRepository;

    public List<DtoNguoiDungChoThongBao> layDanhSach() {
        return nguoiDungRepository.findAll().stream()
                .map(this::sangDto)
                .collect(Collectors.toList());
    }

    private DtoNguoiDungChoThongBao sangDto(NguoiDung nd) {
        DtoNguoiDungChoThongBao dto = new DtoNguoiDungChoThongBao();
        dto.setId(nd.getId());
        dto.setTenDangNhap(nd.getTenDangNhap());
        dto.setHoTen(nd.getHoTen());
        dto.setVaiTro(nd.getVaiTro());
        KhachThue khach = khachThueRepository.findByNguoiDung_Id(nd.getId());
        if (khach == null) {
            return dto;
        }
        List<HopDong> hopDongs = hopDongRepository.findThuocKhachThueCoPhong(khach.getId());
        Set<String> maPhong = new LinkedHashSet<>();
        Set<String> tenKhu = new LinkedHashSet<>();
        for (HopDong h : hopDongs) {
            if (h.getTrangThai() != TrangThaiHopDong.ACTIVE) {
                continue;
            }
            if (h.getPhong() != null) {
                maPhong.add(h.getPhong().getMaPhong());
                if (h.getPhong().getKhuVuc() != null) {
                    tenKhu.add(h.getPhong().getKhuVuc().getTen());
                }
            }
        }
        if (!maPhong.isEmpty()) {
            dto.setPhongHienThue(String.join(", ", maPhong));
        }
        if (!tenKhu.isEmpty()) {
            dto.setKhuHienThue(String.join(", ", tenKhu));
        }
        return dto;
    }
}
