package com.motelmanagement.security;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Filter đọc JWT từ header Authorization và đặt thông tin đăng nhập vào SecurityContext. */
@Component
public class BoLocJwt extends OncePerRequestFilter {
    private final TienIchJwt tienIchJwt;

    public BoLocJwt(TienIchJwt tienIchJwt) {
        this.tienIchJwt = tienIchJwt;
    }

    /** Map claim role (ADMIN / ROLE_ADMIN) thành tên authority cho hasRole('ADMIN'). */
    private static String chuyenVaiTroThanhTenQuyen(String vaiTro) {
        if (vaiTro == null || vaiTro.isBlank()) {
            return "ROLE_USER";
        }
        if (vaiTro.startsWith("ROLE_")) {
            return vaiTro;
        }
        return "ROLE_" + vaiTro;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest yeuCau, HttpServletResponse phanHoi, FilterChain filterChain)
            throws ServletException, IOException {
        String header = yeuCau.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = tienIchJwt.parseClaims(token);
                String username = claims.getSubject();
                String vaiTro = claims.get("role", String.class);
                // Luôn đặt xác thực từ JWT khi parse OK (tránh bỏ qua khi context đã có Anonymous
                // hoặc filter khác; hasRole('ADMIN') cần ROLE_ADMIN đúng).
                if (username != null) {
                    String role = chuyenVaiTroThanhTenQuyen(vaiTro);
                    UsernamePasswordAuthenticationToken xacThuc = new UsernamePasswordAuthenticationToken(
                            username, null, List.of(new SimpleGrantedAuthority(role))
                    );
                    xacThuc.setDetails(new WebAuthenticationDetailsSource().buildDetails(yeuCau));
                    SecurityContextHolder.getContext().setAuthentication(xacThuc);
                }
            } catch (Exception ignored) {
                // Token không hợp lệ: bỏ qua, để Spring Security xử lý 401
            }
        }
        filterChain.doFilter(yeuCau, phanHoi);
    }
}
