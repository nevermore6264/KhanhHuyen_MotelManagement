package com.motelmanagement.support;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import com.motelmanagement.config.XuLyNgoaiLeBaoMat;

/**
 * Cấu hình dùng chung cho {@code @WebMvcTest}: method security + xử lý 403 khi {@code @PreAuthorize} từ chối.
 */
@Configuration
@Import({KiemThuPhuongThucBaoMat.class, XuLyNgoaiLeBaoMat.class})
public class KiemThuSliceWebMvc {}
