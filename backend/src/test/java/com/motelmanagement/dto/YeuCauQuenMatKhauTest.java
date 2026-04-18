package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class YeuCauQuenMatKhauTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.YeuCauQuenMatKhau", YeuCauQuenMatKhau.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = YeuCauQuenMatKhau.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
