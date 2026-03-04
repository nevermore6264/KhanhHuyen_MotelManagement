package com.motelmanagement.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/** Cấu hình bảo mật: JWT, CORS, quyền truy cập API. */
@Configuration
@EnableMethodSecurity
public class CauHinhBaoMat {
    private final BoLocJwt boLocJwt;

    public CauHinhBaoMat(BoLocJwt boLocJwt) {
        this.boLocJwt = boLocJwt;
    }

    /** Định nghĩa chuỗi filter: vô hiệu CSRF, CORS mặc định, session stateless, JWT filter. */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
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
