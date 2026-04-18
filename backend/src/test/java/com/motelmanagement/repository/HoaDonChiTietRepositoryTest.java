package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class HoaDonChiTietRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(HoaDonChiTietRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(HoaDonChiTietRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.HoaDonChiTietRepository", HoaDonChiTietRepository.class.getName());
    }
}
