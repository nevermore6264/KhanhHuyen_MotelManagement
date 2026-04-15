package com.motelmanagement.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.motelmanagement.config.ThuocTinhMail;
import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.HopDongThanhVien;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.domain.TrangThaiHopDong;
import com.motelmanagement.repository.HoaDonRepository;
import com.motelmanagement.repository.HopDongRepository;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
/** Dịch vụ gửi nhắc nợ hóa đơn qua email/SMS. */
@RequiredArgsConstructor
@Slf4j
public class NhacNoHoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final HopDongRepository hopDongRepository;
    private final ThuocTinhMail thuocTinhMail;
    private final SmsService smsService;

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    private static String formatMoney(BigDecimal amount) {
        if (amount == null) return "0";
        return String.format("%,d", amount.longValue()) + " VNĐ";
    }

    private static String buildReminderBody(HoaDon hoaDon, KhachThue nguoiNhan) {
        String phong = hoaDon.getPhong() != null ? hoaDon.getPhong().getMaPhong() : "—";
        String ky = hoaDon.getThang() + "/" + hoaDon.getNam();
        String tong = formatMoney(hoaDon.getTongTien());
        String ten = nguoiNhan != null && nguoiNhan.getHoTen() != null && !nguoiNhan.getHoTen().isBlank()
                ? nguoiNhan.getHoTen()
                : "Quý khách";
        return String.format(
                "Kính gửi %s,\n\nNhắc nợ hóa đơn tiền trọ:\n- Phòng: %s\n- Kỳ: %s\n- Tổng cộng: %s\n\nVui lòng thanh toán sớm.\nTrân trọng.",
                ten, phong, ky, tong
        );
    }

    private static String buildReminderSmsText(HoaDon hoaDon) {
        String phong = hoaDon.getPhong() != null ? hoaDon.getPhong().getMaPhong() : "—";
        String ky = hoaDon.getThang() + "/" + hoaDon.getNam();
        String tong = formatMoney(hoaDon.getTongTien());
        return String.format("Nhac no: Phong %s, ky %s, tong %s. Vui long thanh toan.", phong, ky, tong);
    }

    /** Gắn khách đại diện từ hợp đồng ACTIVE nếu hóa đơn chưa có (chỉ bộ nhớ; lưu khi cập nhật nhắc nợ). */
    private void ganKhachDaiDienTuHopDongNeuThieu(HoaDon hoaDon) {
        if (hoaDon.getKhachThue() != null || hoaDon.getPhong() == null) {
            return;
        }
        hopDongRepository
                .findByPhong_IdAndTrangThai(hoaDon.getPhong().getId(), TrangThaiHopDong.ACTIVE)
                .map(HopDong::getKhachThue)
                .ifPresent(hoaDon::setKhachThue);
    }

    /**
     * Thứ tự: khách trên hóa đơn (nếu có) → đại diện HĐ → các thành viên. Chọn người đầu tiên có email hoặc SĐT.
     */
    private Map<Long, KhachThue> gomKhachTheoPhong(HoaDon hoaDon) {
        LinkedHashMap<Long, KhachThue> gom = new LinkedHashMap<>();
        if (hoaDon.getKhachThue() != null) {
            gom.put(hoaDon.getKhachThue().getId(), hoaDon.getKhachThue());
        }
        if (hoaDon.getPhong() == null) {
            return gom;
        }
        hopDongRepository
                .findByPhong_IdAndTrangThai(hoaDon.getPhong().getId(), TrangThaiHopDong.ACTIVE)
                .ifPresent(hd -> {
                    if (hd.getKhachThue() != null) {
                        gom.putIfAbsent(hd.getKhachThue().getId(), hd.getKhachThue());
                    }
                    if (hd.getThanhVien() != null) {
                        for (HopDongThanhVien tv : hd.getThanhVien()) {
                            if (tv.getKhachThue() != null) {
                                gom.putIfAbsent(tv.getKhachThue().getId(), tv.getKhachThue());
                            }
                        }
                    }
                });
        return gom;
    }

    private static Optional<KhachThue> chonKhachCoEmail(Map<Long, KhachThue> gom) {
        return gom.values().stream()
                .filter(k -> k.getEmail() != null && !k.getEmail().isBlank())
                .findFirst();
    }

    private static Optional<KhachThue> chonKhachCoSoDienThoai(Map<Long, KhachThue> gom) {
        return gom.values().stream()
                .filter(k -> k.getSoDienThoai() != null && !k.getSoDienThoai().isBlank())
                .findFirst();
    }

    /**
     * Gửi nhắc nợ qua email (JavaMailSender) hoặc SMS (gateway HTTP).
     * Nếu chưa cấu hình mail/SMS thì vẫn ghi log và cập nhật lastReminder*At.
     */
    public Optional<String> guiNhacNo(Long maHoaDon, String kenh) {
        if (!"email".equalsIgnoreCase(kenh) && !"sms".equalsIgnoreCase(kenh)) {
            return Optional.of("Kênh không hợp lệ. Chọn email hoặc sms.");
        }
        HoaDon hoaDon = hoaDonRepository.timTheoIdCoPhong(maHoaDon).orElse(null);
        if (hoaDon == null) {
            return Optional.of("Không tìm thấy hóa đơn.");
        }
        if (hoaDon.getTrangThai() == TrangThaiHoaDon.PAID) {
            return Optional.of("Hóa đơn đã thanh toán, không cần nhắc.");
        }

        ganKhachDaiDienTuHopDongNeuThieu(hoaDon);
        Map<Long, KhachThue> gomKhach = gomKhachTheoPhong(hoaDon);
        if (gomKhach.isEmpty()) {
            return Optional.of("Hóa đơn chưa gắn khách thuê và phòng không có hợp đồng đang hiệu lực.");
        }

        if ("email".equalsIgnoreCase(kenh)) {
            Optional<KhachThue> nguoiGui = chonKhachCoEmail(gomKhach);
            if (nguoiGui.isEmpty()) {
                return Optional.of(
                        "Không có khách nào (trên hóa đơn hoặc trong hợp đồng) có email để gửi nhắc nợ.");
            }
            KhachThue nguoiNhan = nguoiGui.get();
            String emailNhan = nguoiNhan.getEmail();
            String maPhong = hoaDon.getPhong() != null ? hoaDon.getPhong().getMaPhong() : null;
            log.info("Reminder EMAIL: invoiceId={}, to={}, room={}, period={}/{}",
                    maHoaDon, emailNhan, maPhong, hoaDon.getThang(), hoaDon.getNam());

            String noiDung = buildReminderBody(hoaDon, nguoiNhan);
            if (javaMailSender != null) {
                try {
                    MimeMessage message = javaMailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                    helper.setFrom(thuocTinhMail.getFrom());
                    helper.setTo(emailNhan.trim());
                    helper.setSubject(String.format("Nhắc nợ - Hóa đơn phòng %s kỳ %d/%d",
                            maPhong != null ? maPhong : "", hoaDon.getThang(), hoaDon.getNam()));
                    helper.setText(noiDung, false);
                    javaMailSender.send(message);
                    log.info("Email sent to {}", emailNhan);
                } catch (MessagingException e) {
                    log.warn("Email send failed: {}", e.getMessage());
                    return Optional.of("Gửi email thất bại: " + e.getMessage());
                }
            }

            hoaDon.setNhacNoEmailLanCuoi(LocalDateTime.now());
            hoaDon.setSoLanNhacNoEmail(hoaDon.getSoLanNhacNoEmail() + 1);
            hoaDon.setNoiDungEmailCuoi(noiDung);
            hoaDonRepository.save(hoaDon);
            return Optional.empty();
        } else {
            Optional<KhachThue> nguoiGui = chonKhachCoSoDienThoai(gomKhach);
            if (nguoiGui.isEmpty()) {
                return Optional.of(
                        "Không có khách nào (trên hóa đơn hoặc trong hợp đồng) có số điện thoại để gửi SMS.");
            }
            KhachThue nguoiNhan = nguoiGui.get();
            String sdtNhan = nguoiNhan.getSoDienThoai();
            String maPhong = hoaDon.getPhong() != null ? hoaDon.getPhong().getMaPhong() : null;
            log.info("Reminder SMS: invoiceId={}, to={}, room={}, period={}/{}",
                    maHoaDon, sdtNhan, maPhong, hoaDon.getThang(), hoaDon.getNam());

            String smsText = buildReminderSmsText(hoaDon);
            boolean daGui = smsService.gui(sdtNhan.trim(), smsText);
            if (!daGui && smsService.isConfigured()) {
                return Optional.of("Gửi SMS thất bại. Kiểm tra cấu hình gateway.");
            }

            hoaDon.setNhacNoSmsLanCuoi(LocalDateTime.now());
            hoaDon.setSoLanNhacNoSms(hoaDon.getSoLanNhacNoSms() + 1);
            hoaDon.setNoiDungSmsCuoi(smsText);
            hoaDonRepository.save(hoaDon);
            return Optional.empty();
        }
    }
}
