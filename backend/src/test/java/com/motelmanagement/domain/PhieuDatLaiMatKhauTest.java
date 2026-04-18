package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class PhieuDatLaiMatKhauTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.PhieuDatLaiMatKhau", PhieuDatLaiMatKhau.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = PhieuDatLaiMatKhau.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
