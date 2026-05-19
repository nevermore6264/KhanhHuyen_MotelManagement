package com.motelmanagement.job;

import com.motelmanagement.service.TinhTienService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.YearMonth;


@Component
@RequiredArgsConstructor
public class CongViecSinhHoaDon {
    private final TinhTienService tinhTienService;

    @Scheduled(cron = "0 0 1 * * ?")
    public void sinhHoaDonHangThang() {
        YearMonth hienTai = YearMonth.now();
        YearMonth thangTruoc = hienTai.minusMonths(1);
        tinhTienService.sinhHoaDonChoThang(thangTruoc.getMonthValue(), thangTruoc.getYear());
        tinhTienService.sinhHoaDonChoThang(hienTai.getMonthValue(), hienTai.getYear());
    }
}
