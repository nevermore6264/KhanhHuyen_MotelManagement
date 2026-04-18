package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class HopDongThanhVienTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.HopDongThanhVien", HopDongThanhVien.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = HopDongThanhVien.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
