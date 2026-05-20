package com.motelmanagement.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.dto.DtoNguoiDungChat;
import com.motelmanagement.repository.NguoiDungRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NguoiDungChoChatService {
    private final NguoiDungRepository nguoiDungRepository;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;

    public List<DtoNguoiDungChat> timKiem(String q) {
        NguoiDung toi = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (toi == null) {
            throw new IllegalArgumentException("Chưa đăng nhập.");
        }
        List<NguoiDung> ds;
        if (q == null || q.isBlank()) {
            ds = nguoiDungRepository.findByKichHoatTrueAndIdNot(toi.getId());
        } else {
            ds = nguoiDungRepository.timChoChat(q.trim(), toi.getId());
        }
        return ds.stream()
                .limit(30)
                .map(n -> DtoNguoiDungChat.builder()
                        .id(n.getId())
                        .hoTen(n.getHoTen())
                        .tenDangNhap(n.getTenDangNhap())
                        .vaiTro(n.getVaiTro())
                        .build())
                .toList();
    }
}
