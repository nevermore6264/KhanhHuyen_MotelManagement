package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class PhanHoiQuenMatKhauTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.PhanHoiQuenMatKhau", PhanHoiQuenMatKhau.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = PhanHoiQuenMatKhau.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
