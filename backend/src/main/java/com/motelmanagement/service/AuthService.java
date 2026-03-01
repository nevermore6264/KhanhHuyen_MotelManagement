package com.motelmanagement.service;

import com.motelmanagement.config.MailProperties;
import com.motelmanagement.domain.PasswordResetToken;
import com.motelmanagement.domain.User;
import com.motelmanagement.dto.*;
import com.motelmanagement.repository.PasswordResetTokenRepository;
import com.motelmanagement.repository.UserRepository;
import com.motelmanagement.security.JwtUtil;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private static final int RESET_TOKEN_VALID_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final MailProperties mailProperties;

    @Autowired(required = false)
    private JavaMailSender javaMailSender;

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!user.isActive() || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getRole().name(), user.getFullName());
    }

    public User register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setActive(true);
        return userRepository.save(user);
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername().trim());
        String baseUrl = request.getResetBaseUrl() != null && !request.getResetBaseUrl().isBlank()
                ? request.getResetBaseUrl().replaceAll("/$", "")
                : "http://localhost:4002";
        if (userOpt.isEmpty()) {
            return new ForgotPasswordResponse(
                    "Nếu tài khoản tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
                    null
            );
        }
        User user = userOpt.get();
        if (!user.isActive()) {
            return new ForgotPasswordResponse(
                    "Nếu tài khoản tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.",
                    null
            );
        }
        passwordResetTokenRepository.deleteByUserId(user.getId());
        String token = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken prt = new PasswordResetToken();
        prt.setToken(token);
        prt.setUser(user);
        prt.setExpiry(LocalDateTime.now().plusMinutes(RESET_TOKEN_VALID_MINUTES));
        passwordResetTokenRepository.save(prt);
        String resetLink = baseUrl + "/reset-password?token=" + token;

        if (user.getEmail() != null && !user.getEmail().isBlank() && javaMailSender != null) {
            try {
                MimeMessage message = javaMailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                helper.setFrom(mailProperties.getFrom());
                helper.setTo(user.getEmail().trim());
                helper.setSubject("Đặt lại mật khẩu - iTro");
                helper.setText("Xin chào " + user.getFullName() + ",\n\nBạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link sau (có hiệu lực " + RESET_TOKEN_VALID_MINUTES + " phút):\n\n" + resetLink + "\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.\n\nTrân trọng,\niTro", false);
                javaMailSender.send(message);
                log.info("Reset password email sent to {}", user.getEmail());
                return new ForgotPasswordResponse("Kiểm tra email để đặt lại mật khẩu.", null);
            } catch (MessagingException e) {
                log.warn("Reset password email failed: {}", e.getMessage());
            }
        }
        return new ForgotPasswordResponse("Dùng link bên dưới để đặt lại mật khẩu (hiệu lực " + RESET_TOKEN_VALID_MINUTES + " phút).", resetLink);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(request.getToken().trim())
                .orElseThrow(() -> new IllegalArgumentException("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."));
        if (prt.isExpired()) {
            passwordResetTokenRepository.delete(prt);
            throw new IllegalArgumentException("Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.");
        }
        User user = prt.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        passwordResetTokenRepository.delete(prt);
        log.info("Password reset for user {}", user.getUsername());
    }
}
