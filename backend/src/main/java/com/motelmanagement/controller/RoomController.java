package com.motelmanagement.controller;

import com.motelmanagement.domain.Area;
import com.motelmanagement.domain.Room;
import com.motelmanagement.domain.RoomStatus;
import com.motelmanagement.repository.AreaRepository;
import com.motelmanagement.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rooms")
public class RoomController {
    private final RoomRepository roomRepository;
    private final AreaRepository areaRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Room> list() {
        return roomRepository.findAll();
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Room> listAvailable() {
        return roomRepository.findByStatus(RoomStatus.AVAILABLE);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Room create(@RequestBody Room room) {
        if (room.getArea() != null && room.getArea().getId() != null) {
            Area area = areaRepository.findById(room.getArea().getId()).orElse(null);
            room.setArea(area);
        }
        return roomRepository.save(room);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Room> update(@PathVariable("id") Long id, @RequestBody Room room) {
        return roomRepository.findById(id)
                .map(existing -> {
                    existing.setCode(room.getCode());
                    existing.setFloor(room.getFloor());
                    existing.setStatus(room.getStatus());
                    existing.setCurrentPrice(room.getCurrentPrice());
                    if (room.getArea() != null && room.getArea().getId() != null) {
                        existing.setArea(areaRepository.findById(room.getArea().getId()).orElse(null));
                    }
                    return ResponseEntity.ok(roomRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        roomRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
