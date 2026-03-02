package com.motelmanagement.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.ThongBao;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.repository.KhoHoaDon;
import com.motelmanagement.repository.KhoNguoiDung;
import com.motelmanagement.repository.KhoThongBao;

import lombok.RequiredArgsConstructor;

/** Dịch vụ thông báo: nhắc thanh toán định kỳ, tạo và đẩy qua WebSocket. */
@Service
@RequiredArgsConstructor
public class ThongBaoService {
    private final KhoHoaDon khoHoaDon;
    private final KhoThongBao khoThongBao;
    private final KhoNguoiDung khoNguoiDung;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(cron = "0 0 9 * * ?")
    public void nhacThanhToanDinhKy() {
        LocalDate hienTai = LocalDate.now();
        List<HoaDon> chuaThanhToan = khoHoaDon.findByStatus(TrangThaiHoaDon.UNPAID);
        for (HoaDon hoaDon : chuaThanhToan) {
            if (hoaDon.getKhachThue() != null && hoaDon.getKhachThue().getUser() != null) {
                NguoiDung nguoiDung = hoaDon.getKhachThue().getUser();
                ThongBao thongBao = new ThongBao();
                thongBao.setUser(nguoiDung);
                thongBao.setMessage(
                        "Nhắc thanh toán hóa đơn " + hoaDon.getMonth() + "/" + hoaDon.getYear()
                                + " cho phòng " + hoaDon.getPhong().getCode()
                                + " vào " + hienTai);
                khoThongBao.save(thongBao);
            }
        }
    }

    /**
     * Tạo thông báo và đẩy realtime qua WebSocket.
     * @param message Nội dung thông báo
     * @param userId Null = gửi cho tất cả user; có giá trị = gửi cho user đó
     */
    public void taoVaDay(String message, Long userId) {
        if (message == null || message.isBlank()) return;
        List<NguoiDung> danhSachNhan = userId != null
                ? khoNguoiDung.findById(userId).map(List::of).orElse(List.of())
                : khoNguoiDung.findAll();
        for (NguoiDung nguoiDung : danhSachNhan) {
            ThongBao thongBao = new ThongBao();
            thongBao.setUser(nguoiDung);
            thongBao.setMessage(message.trim());
            thongBao = khoThongBao.save(thongBao);
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", thongBao.getId());
            payload.put("message", thongBao.getMessage());
            payload.put("readFlag", thongBao.isReadFlag());
            payload.put("sentAt", thongBao.getSentAt() != null ? thongBao.getSentAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null);
            messagingTemplate.convertAndSendToUser(nguoiDung.getTenDangNhap(), "/queue/notifications", payload);
        }
    }
}
