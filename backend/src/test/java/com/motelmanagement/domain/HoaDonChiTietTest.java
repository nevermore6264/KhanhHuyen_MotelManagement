package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class HoaDonChiTietTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.HoaDonChiTiet", HoaDonChiTiet.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = HoaDonChiTiet.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
