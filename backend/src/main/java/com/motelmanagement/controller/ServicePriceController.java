package com.motelmanagement.controller;

import com.motelmanagement.domain.ServicePrice;
import com.motelmanagement.repository.ServicePriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/service-prices")
public class ServicePriceController {
    private final ServicePriceRepository servicePriceRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<ServicePrice> list() {
        return servicePriceRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ServicePrice create(@RequestBody ServicePrice servicePrice) {
        return servicePriceRepository.save(servicePrice);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServicePrice> update(@PathVariable("id") Long id, @RequestBody ServicePrice payload) {
        return servicePriceRepository.findById(id)
                .map(existing -> {
                    existing.setRoomPrice(payload.getRoomPrice());
                    existing.setElectricityPrice(payload.getElectricityPrice());
                    existing.setWaterPrice(payload.getWaterPrice());
                    existing.setEffectiveFrom(payload.getEffectiveFrom());
                    return ResponseEntity.ok(servicePriceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        servicePriceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
