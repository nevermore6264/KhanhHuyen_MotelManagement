package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class ThanhToanRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(ThanhToanRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(ThanhToanRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.ThanhToanRepository", ThanhToanRepository.class.getName());
    }
}
