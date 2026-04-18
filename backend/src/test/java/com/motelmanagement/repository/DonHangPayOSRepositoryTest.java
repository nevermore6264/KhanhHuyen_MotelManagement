package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class DonHangPayOSRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(DonHangPayOSRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(DonHangPayOSRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.DonHangPayOSRepository", DonHangPayOSRepository.class.getName());
    }
}
