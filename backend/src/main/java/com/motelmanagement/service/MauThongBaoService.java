package com.motelmanagement.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.motelmanagement.dto.MauThongBaoDto;

@Service
public class MauThongBaoService {

    private static final List<MauThongBaoDto> MAU = List.of(
            new MauThongBaoDto(
                    "nhac-dong-tien",
                    "Nhắc đóng tiền",
                    "Kính gửi quý khách, hóa đơn tháng {thang}/{nam} đã phát hành. Vui lòng thanh toán trước ngày {han} để tránh phí phạt."),
            new MauThongBaoDto(
                    "sua-chua-xong",
                    "Sửa chữa xong",
                    "Yêu cầu hỗ trợ của bạn đã được xử lý xong. Nếu còn vấn đề, vui lòng phản hồi qua mục Yêu cầu hoặc Tin nhắn."),
            new MauThongBaoDto(
                    "hop-dong-sap-het-han",
                    "Hợp đồng sắp hết hạn",
                    "Hợp đồng thuê phòng {phong} sẽ hết hạn vào ngày {ngay}. Vui lòng liên hệ quản lý để gia hạn."),
            new MauThongBaoDto(
                    "chi-so-dien-nuoc",
                    "Chốt chỉ số điện nước",
                    "Đã chốt chỉ số điện nước kỳ {thang}/{nam} cho phòng {phong}. Chi tiết trên hóa đơn trong ứng dụng."),
            new MauThongBaoDto(
                    "chao-mung",
                    "Chào mừng",
                    "Chào mừng bạn đến với iTro. Tài khoản đã được kích hoạt. Mọi thắc mắc xin liên hệ ban quản lý."));

    public List<MauThongBaoDto> layDanhSach() {
        return MAU;
    }
}
