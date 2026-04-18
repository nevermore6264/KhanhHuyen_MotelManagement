package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class DtoLienKetNguoiDungKhachThueTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.DtoLienKetNguoiDungKhachThue", DtoLienKetNguoiDungKhachThue.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = DtoLienKetNguoiDungKhachThue.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
