package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class HopDongTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.HopDong", HopDong.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = HopDong.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
