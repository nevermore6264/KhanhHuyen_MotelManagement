package com.motelmanagement.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/** Filter đọc JWT từ header Authorization và đặt thông tin đăng nhập vào SecurityContext. */
@Component
public class BoLocJwt extends OncePerRequestFilter {
    private final TienIchJwt tienIchJwt;

    public BoLocJwt(TienIchJwt tienIchJwt) {
        this.tienIchJwt = tienIchJwt;
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
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken xacThuc = new UsernamePasswordAuthenticationToken(
                            username, null, List.of(new SimpleGrantedAuthority("ROLE_" + vaiTro))
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
