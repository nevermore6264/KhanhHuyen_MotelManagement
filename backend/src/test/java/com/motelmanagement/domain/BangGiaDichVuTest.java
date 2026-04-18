package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class BangGiaDichVuTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.BangGiaDichVu", BangGiaDichVu.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = BangGiaDichVu.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
