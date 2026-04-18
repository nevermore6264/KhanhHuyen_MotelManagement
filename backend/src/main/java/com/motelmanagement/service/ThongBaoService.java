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
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.repository.ThongBaoRepository;

import lombok.RequiredArgsConstructor;

/** Dịch vụ thông báo: nhắc thanh toán định kỳ, tạo và đẩy qua WebSocket. */
@Service
@RequiredArgsConstructor
public class ThongBaoService {
    private final HoaDonRepository hoaDonRepository;
    private final ThongBaoRepository thongBaoRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(cron = "0 0 9 * * ?")
    public void nhacThanhToanDinhKy() {
        LocalDate hienTai = LocalDate.now();
        List<HoaDon> chuaThanhToan = hoaDonRepository.findByTrangThai(TrangThaiHoaDon.UNPAID);
        for (HoaDon hoaDon : chuaThanhToan) {
            if (hoaDon.getKhachThue() != null && hoaDon.getKhachThue().getNguoiDung() != null) {
                NguoiDung nguoiDung = hoaDon.getKhachThue().getNguoiDung();
                ThongBao thongBao = new ThongBao();
                thongBao.setNguoiDung(nguoiDung);
                String maPhong = hoaDon.getPhong() != null ? hoaDon.getPhong().getMaPhong() : "?";
                thongBao.setNoiDung(
                        "Nhắc thanh toán hóa đơn " + hoaDon.getThang() + "/" + hoaDon.getNam()
                                + " cho phòng " + maPhong
                                + " vào " + hienTai);
                thongBao = thongBaoRepository.save(thongBao);
                guiRealtimeDenNguoiDung(thongBao, nguoiDung);
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
                ? nguoiDungRepository.findById(userId).map(List::of).orElse(List.of())
                : nguoiDungRepository.findAll();
        for (NguoiDung nguoiDung : danhSachNhan) {
            ThongBao thongBao = new ThongBao();
            thongBao.setNguoiDung(nguoiDung);
            thongBao.setNoiDung(message.trim());
            thongBao = thongBaoRepository.save(thongBao);
            guiRealtimeDenNguoiDung(thongBao, nguoiDung);
        }
    }

    private static Map<String, Object> buildPayloadThongBao(ThongBao thongBao) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", thongBao.getId());
        payload.put("message", thongBao.getNoiDung());
        payload.put("readFlag", thongBao.isDaDoc());
        payload.put("sentAt", thongBao.getThoiGianGui() != null
                ? thongBao.getThoiGianGui().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                : null);
        return payload;
    }

    /** Đẩy tới subscription /user/queue/notifications (principal = tên đăng nhập). */
    private void guiRealtimeDenNguoiDung(ThongBao thongBao, NguoiDung nguoiDung) {
        if (nguoiDung == null || nguoiDung.getTenDangNhap() == null
                || nguoiDung.getTenDangNhap().isBlank()) {
            return;
        }
        messagingTemplate.convertAndSendToUser(
                nguoiDung.getTenDangNhap(),
                "/queue/notifications",
                buildPayloadThongBao(thongBao));
    }
}
