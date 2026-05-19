package com.motelmanagement.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.dto.CapNhatHoSoCaNhanDto;
import com.motelmanagement.dto.HoSoCaNhanDto;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.NguoiDungRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HoSoCaNhanService {
    private final NguoiDungRepository nguoiDungRepository;
    private final KhachThueRepository khachThueRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;

    public HoSoCaNhanDto layHoSoCuaToi() {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            throw new IllegalArgumentException("Chưa đăng nhập.");
        }
        return xayHoSo(nguoiDung);
    }

    @Transactional
    public HoSoCaNhanDto capNhatHoSoCuaToi(CapNhatHoSoCaNhanDto yeuCau) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            throw new IllegalArgumentException("Chưa đăng nhập.");
        }
        nguoiDung.setHoTen(yeuCau.getHoTen().trim());
        nguoiDung.setSoDienThoai(chuanHoa(yeuCau.getSoDienThoai()));
        nguoiDung.setEmail(chuanHoa(yeuCau.getEmail()));
        nguoiDungRepository.save(nguoiDung);

        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        if (khachThue != null) {
            khachThue.setHoTen(nguoiDung.getHoTen());
            khachThue.setSoDienThoai(nguoiDung.getSoDienThoai());
            khachThue.setEmail(nguoiDung.getEmail());
            if (yeuCau.getSoGiayTo() != null) {
                khachThue.setSoGiayTo(chuanHoa(yeuCau.getSoGiayTo()));
            }
            if (yeuCau.getDiaChi() != null) {
                khachThue.setDiaChi(chuanHoa(yeuCau.getDiaChi()));
            }
            khachThueRepository.save(khachThue);
        }
        return xayHoSo(nguoiDung);
    }

    private HoSoCaNhanDto xayHoSo(NguoiDung nguoiDung) {
        HoSoCaNhanDto dto = new HoSoCaNhanDto();
        dto.setId(nguoiDung.getId());
        dto.setTenDangNhap(nguoiDung.getTenDangNhap());
        dto.setHoTen(nguoiDung.getHoTen());
        dto.setSoDienThoai(nguoiDung.getSoDienThoai());
        dto.setEmail(nguoiDung.getEmail());
        dto.setVaiTro(nguoiDung.getVaiTro() != null ? nguoiDung.getVaiTro().name() : null);
        dto.setKichHoat(nguoiDung.isKichHoat());
        KhachThue khachThue = khachThueRepository.findByNguoiDung_Id(nguoiDung.getId());
        if (khachThue != null) {
            dto.setKhachThueId(khachThue.getId());
            dto.setSoGiayTo(khachThue.getSoGiayTo());
            dto.setDiaChi(khachThue.getDiaChi());
            if (dto.getEmail() == null || dto.getEmail().isBlank()) {
                dto.setEmail(khachThue.getEmail());
            }
        }
        return dto;
    }

    private static String chuanHoa(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
