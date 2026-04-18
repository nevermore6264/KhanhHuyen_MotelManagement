package com.motelmanagement.support;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

/** Bật {@code @PreAuthorize} trong {@code @WebMvcTest} (không cần full CauHinhBaoMat). */
@Configuration
@EnableMethodSecurity
public class KiemThuPhuongThucBaoMat {
}
