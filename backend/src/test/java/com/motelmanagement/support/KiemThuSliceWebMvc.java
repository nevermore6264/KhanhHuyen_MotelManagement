package com.motelmanagement.support;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import com.motelmanagement.config.XuLyNgoaiLeBaoMat;


@Configuration
@Import({KiemThuPhuongThucBaoMat.class, XuLyNgoaiLeBaoMat.class})
public class KiemThuSliceWebMvc {}
