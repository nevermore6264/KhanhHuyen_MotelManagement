package com.motelmanagement.dto;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;

class DtoNguoiDungChoThongBaoTest {

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.dto.DtoNguoiDungChoThongBao", DtoNguoiDungChoThongBao.class.getName());
    }

    @Test
    void coTheTaoBangConstructorKhongThamSo() throws Exception {
        Constructor<?> c = DtoNguoiDungChoThongBao.class.getDeclaredConstructor();
        c.setAccessible(true);
        assertNotNull(c.newInstance());
    }
}
