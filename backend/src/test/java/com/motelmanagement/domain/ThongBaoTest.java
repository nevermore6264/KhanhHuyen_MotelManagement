package com.motelmanagement.domain;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class ThongBaoTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.domain.ThongBao", ThongBao.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = ThongBao.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
