package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class YeuCauLuuChiTietHoaDonTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.YeuCauLuuChiTietHoaDon", YeuCauLuuChiTietHoaDon.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = YeuCauLuuChiTietHoaDon.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
