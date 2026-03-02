package com.motelmanagement.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

/** Tiện ích tạo và parse JWT (username, role, thời hạn). */
@Component
public class TienIchJwt {
    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expirationMs}")
    private long expirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** Sinh token JWT từ username và role. */
    public String generateToken(String username, String vaiTro) {
        Date hienTai = new Date();
        Date hetHan = new Date(hienTai.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(username)
                .claim("role", vaiTro)
                .setIssuedAt(hienTai)
                .setExpiration(hetHan)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** Giải mã và lấy claims từ token (ném ngoại lệ nếu hết hạn/sai chữ ký). */
    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
