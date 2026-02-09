package com.motelmanagement.repository;

import com.motelmanagement.domain.Room;
import com.motelmanagement.domain.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByStatus(RoomStatus status);
}
