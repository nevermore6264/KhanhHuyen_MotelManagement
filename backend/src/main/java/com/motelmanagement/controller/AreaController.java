package com.motelmanagement.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.Area;
import com.motelmanagement.domain.ContractStatus;
import com.motelmanagement.dto.AreaWithRoomCountDto;
import com.motelmanagement.repository.AreaRepository;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.RoomRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/areas")
public class AreaController {
    private final AreaRepository areaRepository;
    private final RoomRepository roomRepository;
    private final ContractRepository contractRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<AreaWithRoomCountDto> list() {
        return areaRepository.findAll().stream()
                .map(a -> {
                    long roomCount = roomRepository.countByArea_Id(a.getId());
                    boolean canDelete = contractRepository.countByRoom_Area_IdAndStatus(a.getId(), ContractStatus.ACTIVE) == 0;
                    return new AreaWithRoomCountDto(a.getId(), a.getName(), a.getAddress(), a.getDescription(), roomCount, canDelete);
                })
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Area create(@RequestBody Area area) {
        return areaRepository.save(area);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Area> update(@PathVariable("id") Long id, @RequestBody Area area) {
        return areaRepository.findById(id)
                .map(existing -> {
                    existing.setName(area.getName());
                    existing.setAddress(area.getAddress());
                    existing.setDescription(area.getDescription());
                    return ResponseEntity.ok(areaRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        if (contractRepository.countByRoom_Area_IdAndStatus(id, ContractStatus.ACTIVE) > 0) {
            return ResponseEntity.badRequest()
                    .body("Không thể xóa khu khi còn phòng đang được thuê. Vui lòng kết thúc hoặc hủy hợp đồng trước.");
        }
        areaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
