package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class HoaDonResponseDtoTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.HoaDonResponseDto", HoaDonResponseDto.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = HoaDonResponseDto.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
