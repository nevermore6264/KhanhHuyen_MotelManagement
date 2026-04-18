package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class YeuCauTaoNguoiDungTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.YeuCauTaoNguoiDung", YeuCauTaoNguoiDung.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = YeuCauTaoNguoiDung.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
