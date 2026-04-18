package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class HopDongTaoDtoTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.HopDongTaoDto", HopDongTaoDto.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = HopDongTaoDto.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
