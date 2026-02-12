package com.motelmanagement.controller;

import com.motelmanagement.domain.MeterReading;
import com.motelmanagement.domain.Room;
import com.motelmanagement.domain.ServicePrice;
import com.motelmanagement.repository.MeterReadingRepository;
import com.motelmanagement.repository.RoomRepository;
import com.motelmanagement.repository.ServicePriceRepository;
import com.motelmanagement.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meter-readings")
public class MeterReadingController {
    private final MeterReadingRepository meterReadingRepository;
    private final RoomRepository roomRepository;
    private final ServicePriceRepository servicePriceRepository;
    private final BillingService billingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<MeterReading> list() {
        return meterReadingRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<MeterReading> create(@RequestBody MeterReading reading) {
        if (reading.getRoom() == null || reading.getRoom().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Room room = roomRepository.findById(reading.getRoom().getId()).orElse(null);
        if (room == null) {
            return ResponseEntity.badRequest().build();
        }
        reading.setRoom(room);

        ServicePrice servicePrice = servicePriceRepository
                .findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
                        LocalDate.of(reading.getYear(), reading.getMonth(), 1))
                .orElse(null);

        BigDecimal electricityUnit = servicePrice != null && servicePrice.getElectricityPrice() != null
                ? servicePrice.getElectricityPrice()
                : BigDecimal.ZERO;
        BigDecimal waterUnit = servicePrice != null && servicePrice.getWaterPrice() != null
                ? servicePrice.getWaterPrice()
                : BigDecimal.ZERO;

        int electricUsage = Math.max(0, reading.getNewElectric() - reading.getOldElectric());
        int waterUsage = Math.max(0, reading.getNewWater() - reading.getOldWater());

        reading.setElectricityCost(electricityUnit.multiply(BigDecimal.valueOf(electricUsage)));
        reading.setWaterCost(waterUnit.multiply(BigDecimal.valueOf(waterUsage)));
        reading.setTotalCost(reading.getElectricityCost().add(reading.getWaterCost()));

        MeterReading saved = meterReadingRepository.save(reading);
        billingService.createOrUpdateInvoiceFromReading(saved);
        return ResponseEntity.ok(saved);
    }
}
