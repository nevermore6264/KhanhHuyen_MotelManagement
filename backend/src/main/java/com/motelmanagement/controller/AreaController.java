package com.motelmanagement.controller;

import com.motelmanagement.domain.Area;
import com.motelmanagement.repository.AreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/areas")
public class AreaController {
    private final AreaRepository areaRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Area> list() {
        return areaRepository.findAll();
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
        areaRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
