package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class NhatKyHeThongTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.NhatKyHeThong", NhatKyHeThong.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = NhatKyHeThong.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
