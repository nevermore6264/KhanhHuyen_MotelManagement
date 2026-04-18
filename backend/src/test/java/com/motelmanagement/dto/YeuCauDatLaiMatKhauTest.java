package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class YeuCauDatLaiMatKhauTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.YeuCauDatLaiMatKhau", YeuCauDatLaiMatKhau.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = YeuCauDatLaiMatKhau.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
