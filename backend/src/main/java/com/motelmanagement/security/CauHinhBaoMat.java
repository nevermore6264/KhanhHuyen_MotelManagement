package com.motelmanagement.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/** Cấu hình bảo mật: JWT, CORS, quyền truy cập API. */
@Configuration
@EnableMethodSecurity
public class CauHinhBaoMat {
    private final BoLocJwt boLocJwt;

    public CauHinhBaoMat(BoLocJwt boLocJwt) {
        this.boLocJwt = boLocJwt;
    }

    /**
     * File ảnh phục vụ qua /tenant-files/ — trình duyệt không gửi header JWT khi tải ảnh.
     * {@code web.ignoring()} bỏ qua toàn bộ SecurityFilterChain (tránh 403 dù đã permitAll).
     */
    @Bean
    public WebSecurityCustomizer boQuaFileKhachThueTinh() {
        return (web) -> web.ignoring().requestMatchers("/tenant-files/**");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Pattern (không dùng allowedOrigins("*") với credentials). Gồm cổng dev FE phổ biến.
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "https://localhost:*",
                "https://127.0.0.1:*"));
        config.setAllowCredentials(true);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /** Định nghĩa chuỗi filter: vô hiệu CSRF, CORS, session stateless, JWT filter. */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/xac-thuc/**").permitAll()
                        .requestMatchers("/api/thanh-toan/payos/webhook").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(boLocJwt, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** Bean mã hóa mật khẩu BCrypt. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
