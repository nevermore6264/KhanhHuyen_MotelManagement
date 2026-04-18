package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class HoaDonChiTietDongDtoTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.HoaDonChiTietDongDto", HoaDonChiTietDongDto.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = HoaDonChiTietDongDto.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
