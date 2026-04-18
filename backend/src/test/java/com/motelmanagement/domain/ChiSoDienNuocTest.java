package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class ChiSoDienNuocTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.ChiSoDienNuoc", ChiSoDienNuoc.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = ChiSoDienNuoc.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
