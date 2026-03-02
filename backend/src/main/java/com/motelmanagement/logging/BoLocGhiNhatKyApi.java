package com.motelmanagement.logging;

import com.motelmanagement.domain.NguoiDung;
import com.motelmanagement.service.NguoiDungHienTaiService;
import com.motelmanagement.service.NhatKyService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/** Filter ghi log API (POST/PUT/DELETE) vào SystemLog với người thực hiện. */
@Component
public class BoLocGhiNhatKyApi extends OncePerRequestFilter {
    private final NhatKyService nhatKyService;
    private final NguoiDungHienTaiService nguoiDungHienTaiService;
    private final Set<String> methods = Set.of("POST", "PUT", "DELETE");

    public BoLocGhiNhatKyApi(NhatKyService nhatKyService, NguoiDungHienTaiService nguoiDungHienTaiService) {
        this.nhatKyService = nhatKyService;
        this.nguoiDungHienTaiService = nguoiDungHienTaiService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest yeuCau,
                                    HttpServletResponse phanHoi,
                                    FilterChain filterChain) throws ServletException, IOException {
        filterChain.doFilter(yeuCau, phanHoi);
        String phuongThuc = yeuCau.getMethod();
        if (!methods.contains(phuongThuc)) {
            return;
        }
        String duongDan = yeuCau.getRequestURI();
        NguoiDung nguoiThucHien = nguoiDungHienTaiService.layNguoiDungHienTai();
        nhatKyService.ghiNhatKy(nguoiThucHien, phuongThuc, "API", null, "Request to " + duongDan);
    }
}
