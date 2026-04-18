package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class HopDongGiaHanDtoTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.HopDongGiaHanDto", HopDongGiaHanDto.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = HopDongGiaHanDto.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
