package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class DonHangPayOSTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.DonHangPayOS", DonHangPayOS.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = DonHangPayOS.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
