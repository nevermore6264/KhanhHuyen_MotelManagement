package com.motelmanagement.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.repository.JpaRepository;

class BangGiaDichVuRepositoryTest {

    @Test
    void lopLaInterface() {
        assertTrue(BangGiaDichVuRepository.class.isInterface());
    }

    @Test
    void moRongJpaRepository() {
        assertTrue(JpaRepository.class.isAssignableFrom(BangGiaDichVuRepository.class));
    }

    @Test
    void tenDayDu() {
        assertEquals("com.motelmanagement.repository.BangGiaDichVuRepository", BangGiaDichVuRepository.class.getName());
    }
}
