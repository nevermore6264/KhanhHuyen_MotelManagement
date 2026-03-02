package com.motelmanagement.service;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.NhatKyHeThong;
import com.motelmanagement.repository.KhoNhatKyHeThong;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Dịch vụ ghi nhật ký hành động vào NhatKyHeThong. */
@Service
@RequiredArgsConstructor
public class NhatKyService {
    private final KhoNhatKyHeThong khoNhatKyHeThong;

    /** Ghi một bản ghi nhật ký (người thực hiện, hành động, loại entity, id, chi tiết). */
    public void ghiNhatKy(NguoiDung nguoiThucHien, String hanhDong, String loaiDoiTuong, String maDoiTuong, String chiTiet) {
        NhatKyHeThong banGhi = new NhatKyHeThong();
        banGhi.setActor(nguoiThucHien);
        banGhi.setAction(hanhDong);
        banGhi.setEntityType(loaiDoiTuong);
        banGhi.setEntityId(maDoiTuong);
        banGhi.setDetail(chiTiet);
        khoNhatKyHeThong.save(banGhi);
    }
}
