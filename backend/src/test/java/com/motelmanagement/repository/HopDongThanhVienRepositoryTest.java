package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class HopDongThanhVienRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(HopDongThanhVienRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(HopDongThanhVienRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.HopDongThanhVienRepository", HopDongThanhVienRepository.class.getName());
    }
}
