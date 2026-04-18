package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class AreaWithRoomCountDtoTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.AreaWithRoomCountDto", AreaWithRoomCountDto.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = AreaWithRoomCountDto.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
