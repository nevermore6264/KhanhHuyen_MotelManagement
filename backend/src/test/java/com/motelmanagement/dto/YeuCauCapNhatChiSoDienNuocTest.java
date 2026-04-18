package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class YeuCauCapNhatChiSoDienNuocTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.YeuCauCapNhatChiSoDienNuoc", YeuCauCapNhatChiSoDienNuoc.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = YeuCauCapNhatChiSoDienNuoc.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
