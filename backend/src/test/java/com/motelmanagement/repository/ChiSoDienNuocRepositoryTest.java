package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class ChiSoDienNuocRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(ChiSoDienNuocRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(ChiSoDienNuocRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.ChiSoDienNuocRepository", ChiSoDienNuocRepository.class.getName());
    }
}
