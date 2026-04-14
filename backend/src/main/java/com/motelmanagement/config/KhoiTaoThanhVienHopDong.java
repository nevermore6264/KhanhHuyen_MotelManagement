package com.motelmanagement.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.motelmanagement.domain.HopDong;
import com.motelmanagement.domain.HopDongThanhVien;
import com.motelmanagement.repository.HopDongRepository;
import com.motelmanagement.repository.HopDongThanhVienRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Bổ sung bảng thành viên hợp đồng cho dữ liệu cũ (một khách = một dòng đại diện).
 */
@Component
@Order(Integer.MAX_VALUE)
@RequiredArgsConstructor
@Slf4j
public class KhoiTaoThanhVienHopDong implements ApplicationRunner {
    private final HopDongRepository hopDongRepository;
    private final HopDongThanhVienRepository hopDongThanhVienRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        for (HopDong hd : hopDongRepository.findAll()) {
            if (hd.getKhachThue() == null) {
                continue;
            }
            if (hopDongThanhVienRepository.countByHopDong_Id(hd.getId()) > 0) {
                continue;
            }
            HopDongThanhVien v = new HopDongThanhVien();
            v.setHopDong(hd);
            v.setKhachThue(hd.getKhachThue());
            v.setLaDaiDien(true);
            hopDongThanhVienRepository.save(v);
            log.debug("Da them thanh vien mac dinh cho hop dong id={}", hd.getId());
        }
    }
}
