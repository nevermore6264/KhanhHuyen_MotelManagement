package com.motelmanagement.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.motelmanagement.config.ThuocTinhMail;
import com.motelmanagement.domain.KhachThue;
import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.domain.PhieuDatLaiMatKhau;
import com.motelmanagement.dto.PhanHoiQuenMatKhau;
import com.motelmanagement.dto.PhanHoiXacThuc;
import com.motelmanagement.dto.YeuCauDangKy;
import com.motelmanagement.dto.YeuCauDatLaiMatKhau;
import com.motelmanagement.dto.YeuCauDoiMatKhau;
import com.motelmanagement.dto.YeuCauQuenMatKhau;
import com.motelmanagement.dto.YeuCauXacThuc;
import com.motelmanagement.repository.KhachThueRepository;
import com.motelmanagement.repository.NguoiDungRepository;
import com.motelmanagement.repository.PhieuDatLaiMatKhauRepository;
import com.motelmanagement.security.TienIchJwt;
import com.motelmanagement.util.GiupGuiEmail;
import com.motelmanagement.util.MauEmailHeThong;
import com.motelmanagement.util.NoiDungEmail;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@Service
@RequiredArgsConstructor
@Slf4j
public class XacThucService {

    private static final int RESET_OTP_VALID_MINUTES = 15;
    private static final SecureRandom OTP_RANDOM = new SecureRandom();

    private final NguoiDungRepository nguoiDungRepository;
    private final KhachThueRepository khachThueRepository;
    private final PhieuDatLaiMatKhauRepository phieuDatLaiMatKhauRepository;
    private final PasswordEncoder passwordEncoder;
    private final TienIchJwt tienIchJwt;
    private final ThuocTinhMail thuocTinhMail;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;

    @Autowired(required = false)
    private JavaMailSender javaMailSender;


    public PhanHoiXacThuc dangNhap(YeuCauXacThuc yeuCau) {
        NguoiDung nguoiDung = nguoiDungRepository.findByTenDangNhap(yeuCau.getTenDangNhap())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!nguoiDung.isKichHoat() || !passwordEncoder.matches(yeuCau.getMatKhau(), nguoiDung.getMatKhau())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = tienIchJwt.generateToken(nguoiDung.getTenDangNhap(), nguoiDung.getVaiTro().name());
        return new PhanHoiXacThuc(
                token,
                nguoiDung.getVaiTro().name(),
                nguoiDung.getHoTen(),
                nguoiDung.getId());
    }


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


    @Transactional
    public PhanHoiQuenMatKhau quenMatKhau(YeuCauQuenMatKhau yeuCau) {
        String email = yeuCau.getEmail().trim();
        String thongBaoChung =
                "Nếu email đã đăng ký trong hệ thống, bạn sẽ nhận mã OTP trong hộp thư (kiểm tra cả thư rác).";
        Optional<TimTaiKhoanTheoEmail> timOpt = timTaiKhoanTheoEmail(email);
        if (timOpt.isEmpty()) {
            return new PhanHoiQuenMatKhau(thongBaoChung, null);
        }
        TimTaiKhoanTheoEmail tim = timOpt.get();
        NguoiDung nguoiDung = tim.nguoiDung();
        String emailGui = tim.emailGui();
        if (!nguoiDung.isKichHoat()) {
            return new PhanHoiQuenMatKhau(thongBaoChung, null);
        }
        phieuDatLaiMatKhauRepository.xoaTheoMaNguoiDung(nguoiDung.getId());
        String otp = String.format("%06d", OTP_RANDOM.nextInt(1_000_000));
        PhieuDatLaiMatKhau phieu = new PhieuDatLaiMatKhau();
        phieu.setMaToken(otp);
        phieu.setNguoiDung(nguoiDung);
        phieu.setHetHanLuc(LocalDateTime.now().plusMinutes(RESET_OTP_VALID_MINUTES));
        phieuDatLaiMatKhauRepository.save(phieu);

        if (javaMailSender != null) {
            try {
                NoiDungEmail noiDung =
                        MauEmailHeThong.datLaiMatKhauOtp(
                                nguoiDung.getHoTen(), otp, RESET_OTP_VALID_MINUTES);
                GiupGuiEmail.guiHtml(
                        javaMailSender,
                        thuocTinhMail.getFrom(),
                        emailGui,
                        "Mã OTP đặt lại mật khẩu - iTro",
                        noiDung.plain(),
                        noiDung.html());
                log.info("Reset OTP email sent to {}", emailGui);
                return new PhanHoiQuenMatKhau(
                        "Mã OTP đã được gửi đến email của bạn (hiệu lực "
                                + RESET_OTP_VALID_MINUTES
                                + " phút).",
                        null);
            } catch (MessagingException e) {
                log.warn("Reset OTP email failed: {}", e.getMessage());
                throw new IllegalArgumentException(
                        "Không gửi được email. Vui lòng thử lại sau hoặc liên hệ quản trị.");
            }
        }
        log.warn("Mail sender not configured — OTP for {}: {}", emailGui, otp);
        return new PhanHoiQuenMatKhau(
                "Mã OTP (môi trường dev — chưa cấu hình email): " + otp,
                otp);
    }


    @Transactional
    public void datLaiMatKhau(YeuCauDatLaiMatKhau yeuCau) {
        String email = yeuCau.getEmail().trim();
        String otp = yeuCau.getOtp().trim();
        PhieuDatLaiMatKhau phieu = phieuDatLaiMatKhauRepository
                .findByEmailAndOtp(email, otp)
                .orElseThrow(() -> new IllegalArgumentException("Mã OTP không đúng hoặc đã hết hạn."));
        if (phieu.daHetHan()) {
            phieuDatLaiMatKhauRepository.delete(phieu);
            throw new IllegalArgumentException("Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.");
        }
        NguoiDung nguoiDung = phieu.getNguoiDung();
        nguoiDung.setMatKhau(passwordEncoder.encode(yeuCau.getNewPassword()));
        nguoiDungRepository.save(nguoiDung);
        phieuDatLaiMatKhauRepository.delete(phieu);
        log.info("Password reset via OTP for user {}", nguoiDung.getTenDangNhap());
    }

    @Transactional
    public void doiMatKhau(YeuCauDoiMatKhau yeuCau) {
        NguoiDung nguoiDung = nguoiDungHienTaiService.layNguoiDungHienTai();
        if (nguoiDung == null) {
            throw new IllegalArgumentException("Chưa đăng nhập.");
        }
        if (!nguoiDung.isKichHoat()) {
            throw new IllegalArgumentException("Tài khoản đã bị khóa.");
        }
        if (!passwordEncoder.matches(yeuCau.getMatKhauCu(), nguoiDung.getMatKhau())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng.");
        }
        if (passwordEncoder.matches(yeuCau.getMatKhauMoi(), nguoiDung.getMatKhau())) {
            throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu hiện tại.");
        }
        nguoiDung.setMatKhau(passwordEncoder.encode(yeuCau.getMatKhauMoi()));
        nguoiDungRepository.save(nguoiDung);
        log.info("Password changed for user {}", nguoiDung.getTenDangNhap());
    }

    private Optional<TimTaiKhoanTheoEmail> timTaiKhoanTheoEmail(String email) {
        String emailChuan = email.trim();
        if (emailChuan.isBlank()) {
            return Optional.empty();
        }
        Optional<NguoiDung> tuNguoiDung =
                nguoiDungRepository.findByEmailIgnoreCaseTrimmed(emailChuan);
        if (tuNguoiDung.isPresent()) {
            NguoiDung nd = tuNguoiDung.get();
            String gui =
                    nd.getEmail() != null && !nd.getEmail().isBlank()
                            ? nd.getEmail().trim()
                            : emailChuan;
            return Optional.of(new TimTaiKhoanTheoEmail(nd, gui));
        }
        return khachThueRepository
                .findFirstByEmailIgnoreCaseTrimmedCoTaiKhoan(emailChuan)
                .map(this::tuKhachThue);
    }

    private TimTaiKhoanTheoEmail tuKhachThue(KhachThue khach) {
        NguoiDung nd = khach.getNguoiDung();
        String gui =
                khach.getEmail() != null && !khach.getEmail().isBlank()
                        ? khach.getEmail().trim()
                        : nd.getEmail() != null ? nd.getEmail().trim() : "";
        return new TimTaiKhoanTheoEmail(nd, gui);
    }

    private record TimTaiKhoanTheoEmail(NguoiDung nguoiDung, String emailGui) {}
}
