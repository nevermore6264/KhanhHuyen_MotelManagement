package com.motelmanagement.service;

import org.springframework.stereotype.Service;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.NhatKyHeThong;
import com.motelmanagement.repository.NhatKyHeThongRepository;

import lombok.RequiredArgsConstructor;

/** Dịch vụ ghi nhật ký hành động vào NhatKyHeThong. */
@Service
@RequiredArgsConstructor
public class NhatKyService {
    private final NhatKyHeThongRepository nhatKyHeThongRepository;

    /** Ghi một bản ghi nhật ký (người thực hiện, hành động, loại entity, id, chi tiết). */
    public void ghiNhatKy(NguoiDung nguoiThucHien, String hanhDong, String loaiDoiTuong, String maDoiTuong, String chiTiet) {
        NhatKyHeThong banGhi = new NhatKyHeThong();
        banGhi.setNguoiThucHien(nguoiThucHien);
        banGhi.setHanhDong(hanhDong);
        banGhi.setLoaiThucThe(loaiDoiTuong);
        banGhi.setMaThucThe(maDoiTuong);
        banGhi.setChiTiet(chiTiet);
        nhatKyHeThongRepository.save(banGhi);
    }
}
