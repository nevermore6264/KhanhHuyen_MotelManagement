package com.motelmanagement.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.motelmanagement.config.ThuocTinhMail;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.PhieuDatLaiMatKhau;
import com.motelmanagement.dto.PhanHoiQuenMatKhau;
import com.motelmanagement.dto.PhanHoiXacThuc;
import com.motelmanagement.dto.YeuCauDangKy;
import com.motelmanagement.dto.YeuCauDatLaiMatKhau;
import com.motelmanagement.dto.YeuCauQuenMatKhau;
import com.motelmanagement.dto.YeuCauXacThuc;
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.repository.PhieuDatLaiMatKhauRepository;
import com.motelmanagement.security.TienIchJwt;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** Dịch vụ xác thực: đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu. */
@Service
@RequiredArgsConstructor
@Slf4j
public class XacThucService {
    /** Số phút token đặt lại mật khẩu có hiệu lực */
    private static final int RESET_TOKEN_VALID_MINUTES = 15;

    private final NguoiDungRepository nguoiDungRepository;
    private final PhieuDatLaiMatKhauRepository phieuDatLaiMatKhauRepository;
    private final PasswordEncoder passwordEncoder;
    private final TienIchJwt tienIchJwt;
    private final ThuocTinhMail thuocTinhMail;

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    /** Đăng nhập: kiểm tra tenDangNhap/matKhau, trả về JWT và thông tin cơ bản. */
    public PhanHoiXacThuc dangNhap(YeuCauXacThuc yeuCau) {
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(yeuCau.getTenDangNhap())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!nguoiDung.isKichHoat() || !passwordEncoder.matches(yeuCau.getMatKhau(), nguoiDung.getMatKhau())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = tienIchJwt.generateToken(nguoiDung.getTenDangNhap(), nguoiDung.getVaiTro().name());
        return new PhanHoiXacThuc(token, nguoiDung.getVaiTro().name(), nguoiDung.getHoTen());
    }

    /** Đăng ký tài khoản mới (mật khẩu được mã hóa). */
    public NguoiDung dangKy(YeuCauDangKy yeuCau) {
        if (nguoiDungRepository.findByTenDangNhap(yeuCau.getTenDangNhap()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        NguoiDung nguoiDung = new NguoiDung();
        nguoiDung.setTenDangNhap(yeuCau.getTenDangNhap());
        nguoiDung.setMatKhau(passwordEncoder.encode(yeuCau.getMatKhau()));
        nguoiDung.setHoTen(yeuCau.getHoTen());
        nguoiDung.setSoDienThoai(yeuCau.getSoDienThoai());
        nguoiDung.setVaiTro(yeuCau.getVaiTro());
        nguoiDung.setKichHoat(true);
        return nguoiDungRepository.save(nguoiDung);
    }

    /** Quên mật khẩu: tạo phiếu + gửi email hoặc trả link đặt lại. */
    @Transactional
    public PhanHoiQuenMatKhau quenMatKhau(YeuCauQuenMatKhau yeuCau) {
        Optional<NguoiDung> nguoiDungOpt = nguoiDungRepository.findByTenDangNhap(yeuCau.getTenDangNhap().trim());
        String baseUrl = yeuCau.getResetBaseUrl() != null && !yeuCau.getResetBaseUrl().isBlank()
                ? yeuCau.getResetBaseUrl().replaceAll("/$", "")
                : "http://localhost:4002";
        if (nguoiDungOpt.isEmpty()) {
            return new PhanHoiQuenMatKhau(
                    "Nếu tài khoản tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
                    null
            );
        }
        NguoiDung nguoiDung = nguoiDungOpt.get();
        if (!nguoiDung.isKichHoat()) {
            return new PhanHoiQuenMatKhau(
                    "Nếu tài khoản tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
                    null
            );
        }
        phieuDatLaiMatKhauRepository.xoaTheoMaNguoiDung(nguoiDung.getId());
        String token = UUID.randomUUID().toString().replace("-", "");
        PhieuDatLaiMatKhau phieu = new PhieuDatLaiMatKhau();
        phieu.setMaToken(token);
        phieu.setNguoiDung(nguoiDung);
        phieu.setHetHanLuc(LocalDateTime.now().plusMinutes(RESET_TOKEN_VALID_MINUTES));
        phieuDatLaiMatKhauRepository.save(phieu);
        String resetLink = baseUrl + "/reset-password?token=" + token;

        if (nguoiDung.getEmail() != null && !nguoiDung.getEmail().isBlank() && javaMailSender != null) {
            try {
                MimeMessage message = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(thuocTinhMail.getFrom());
                helper.setTo(nguoiDung.getEmail().trim());
                helper.setSubject("Đặt lại mật khẩu - iTro");
                helper.setText("Xin chào " + nguoiDung.getHoTen() + ",\n\nBạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link sau (có hiệu lực " + RESET_TOKEN_VALID_MINUTES + " phút):\n\n" + resetLink + "\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.\n\nTrân trọng,\niTro", false);
                javaMailSender.send(message);
                log.info("Reset password email sent to {}", nguoiDung.getEmail());
                return new PhanHoiQuenMatKhau("Kiểm tra email để đặt lại mật khẩu.", null);
            } catch (MessagingException e) {
                log.warn("Reset password email failed: {}", e.getMessage());
            }
        }
        return new PhanHoiQuenMatKhau("Dùng link bên dưới để đặt lại mật khẩu (hiệu lực " + RESET_TOKEN_VALID_MINUTES + " phút).", resetLink);
    }

    /** Đặt lại mật khẩu theo token từ link (sau đó xóa phiếu). */
    @Transactional
    public void datLaiMatKhau(YeuCauDatLaiMatKhau yeuCau) {
        PhieuDatLaiMatKhau phieu = phieuDatLaiMatKhauRepository.findByMaToken(yeuCau.getToken().trim())
                .orElseThrow(() -> new IllegalArgumentException("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."));
        if (phieu.daHetHan()) {
            phieuDatLaiMatKhauRepository.delete(phieu);
            throw new IllegalArgumentException("Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.");
        }
        NguoiDung nguoiDung = phieu.getNguoiDung();
        nguoiDung.setMatKhau(passwordEncoder.encode(yeuCau.getNewPassword()));
        nguoiDungRepository.save(nguoiDung);
        phieuDatLaiMatKhauRepository.delete(phieu);
        log.info("Password reset for user {}", nguoiDung.getTenDangNhap());
    }
}
