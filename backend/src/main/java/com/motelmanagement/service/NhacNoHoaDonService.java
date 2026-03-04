package com.motelmanagement.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.motelmanagement.config.ThuocTinhMail;
import com.motelmanagement.domain.HoaDon;
import com.motelmanagement.domain.TrangThaiHoaDon;
import com.motelmanagement.repository.HoaDonRepository;

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
    private final ThuocTinhMail thuocTinhMail;
    private final SmsService smsService;

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    private static String formatMoney(BigDecimal amount) {
        if (amount == null) return "0";
        return String.format("%,d", amount.longValue()) + " VNĐ";
    }

    private static String buildReminderBody(HoaDon hoaDon) {
        String phong = hoaDon.getPhong() != null ? hoaDon.getPhong().getMaPhong() : "—";
        String ky = hoaDon.getThang() + "/" + hoaDon.getNam();
        String tong = formatMoney(hoaDon.getTongTien());
        String ten = hoaDon.getKhachThue() != null ? hoaDon.getKhachThue().getHoTen() : "Khách";
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

    /**
     * Gửi nhắc nợ qua email (JavaMailSender) hoặc SMS (gateway HTTP).
     * Nếu chưa cấu hình mail/SMS thì vẫn ghi log và cập nhật lastReminder*At.
     */
    public Optional<String> guiNhacNo(Long maHoaDon, String kenh) {
        if (!"email".equalsIgnoreCase(kenh) && !"sms".equalsIgnoreCase(kenh)) {
            return Optional.of("Kênh không hợp lệ. Chọn email hoặc sms.");
        }
        HoaDon hoaDon = hoaDonRepository.findById(maHoaDon).orElse(null);
        if (hoaDon == null) {
            return Optional.of("Không tìm thấy hóa đơn.");
        }
        if (hoaDon.getKhachThue() == null) {
            return Optional.of("Hóa đơn chưa gắn khách thuê.");
        }
        if (hoaDon.getTrangThai() == TrangThaiHoaDon.PAID) {
            return Optional.of("Hóa đơn đã thanh toán, không cần nhắc.");
        }

        String emailNhan = hoaDon.getKhachThue().getEmail();
        String sdtNhan = hoaDon.getKhachThue().getSoDienThoai();
        if ("email".equalsIgnoreCase(kenh)) {
            if (emailNhan == null || emailNhan.isBlank()) {
                return Optional.of("Khách thuê chưa có email.");
            }
            String maPhong = hoaDon.getPhong() != null ? hoaDon.getPhong().getMaPhong() : null;
            log.info("Reminder EMAIL: invoiceId={}, to={}, room={}, period={}/{}",
                    maHoaDon, emailNhan, maPhong, hoaDon.getThang(), hoaDon.getNam());

            String noiDung = buildReminderBody(hoaDon);
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
            if (sdtNhan == null || sdtNhan.isBlank()) {
                return Optional.of("Khách thuê chưa có số điện thoại.");
            }
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
