package com.motelmanagement.repository;

import com.motelmanagement.domain.MeterReading;
import com.motelmanagement.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {
    Optional<MeterReading> findByRoomAndMonthAndYear(Room room, int month, int year);
}
