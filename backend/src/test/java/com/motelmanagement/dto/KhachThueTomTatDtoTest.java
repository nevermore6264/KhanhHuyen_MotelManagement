package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class KhachThueTomTatDtoTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.KhachThueTomTatDto", KhachThueTomTatDto.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = KhachThueTomTatDto.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
