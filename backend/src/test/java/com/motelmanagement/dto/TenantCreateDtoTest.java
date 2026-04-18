package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class TenantCreateDtoTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.TenantCreateDto", TenantCreateDto.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = TenantCreateDto.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
