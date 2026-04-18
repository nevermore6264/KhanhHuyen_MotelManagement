package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class YeuCauDangKyTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.YeuCauDangKy", YeuCauDangKy.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = YeuCauDangKy.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
