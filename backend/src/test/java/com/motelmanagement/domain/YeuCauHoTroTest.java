package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class YeuCauHoTroTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.YeuCauHoTro", YeuCauHoTro.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = YeuCauHoTro.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
