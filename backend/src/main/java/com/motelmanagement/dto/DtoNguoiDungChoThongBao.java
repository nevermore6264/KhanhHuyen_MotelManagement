package com.motelmanagement.dto;

import com.motelmanagement.domain.VaiTro;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Thông tin người dùng để chọn người nhận thông báo (kèm phòng/khu đang thuê nếu có). */
@Getter
@Setter
@NoArgsConstructor
public class DtoNguoiDungChoThongBao {
    private Long id;
    private String tenDangNhap;
    private String hoTen;
    private VaiTro vaiTro;
    /** Mã phòng các hợp đồng ACTIVE (nhiều phòng thì nối bằng dấu phẩy). */
    private String phongHienThue;
    /** Tên khu tương ứng (distinct, nối bằng dấu phẩy). */
    private String khuHienThue;
}
