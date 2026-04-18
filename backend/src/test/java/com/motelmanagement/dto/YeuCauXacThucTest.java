package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class YeuCauXacThucTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.YeuCauXacThuc", YeuCauXacThuc.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = YeuCauXacThuc.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
