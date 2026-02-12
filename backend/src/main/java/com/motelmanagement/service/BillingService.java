package com.motelmanagement.service;

import com.motelmanagement.domain.*;
import com.motelmanagement.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BillingService {
    private final InvoiceRepository invoiceRepository;
    private final ServicePriceRepository servicePriceRepository;
    private final ContractRepository contractRepository;

    public Invoice createOrUpdateInvoiceFromReading(MeterReading reading) {
        Invoice invoice = invoiceRepository
                .findByRoomIdAndMonthAndYear(reading.getRoom().getId(), reading.getMonth(), reading.getYear())
                .orElseGet(Invoice::new);

        invoice.setRoom(reading.getRoom());
        invoice.setMonth(reading.getMonth());
        invoice.setYear(reading.getYear());

        ServicePrice servicePrice = servicePriceRepository
                .findFirstByEffectiveFromLessThanEqualOrderByEffectiveFromDesc(
                        LocalDate.of(reading.getYear(), reading.getMonth(), 1))
                .orElse(null);

        BigDecimal roomPrice = servicePrice != null && servicePrice.getRoomPrice() != null
                ? servicePrice.getRoomPrice()
                : reading.getRoom().getCurrentPrice() != null ? reading.getRoom().getCurrentPrice() : BigDecimal.ZERO;

        invoice.setRoomCost(roomPrice);
        invoice.setElectricityCost(reading.getElectricityCost());
        invoice.setWaterCost(reading.getWaterCost());

        BigDecimal total = roomPrice
                .add(reading.getElectricityCost() != null ? reading.getElectricityCost() : BigDecimal.ZERO)
                .add(reading.getWaterCost() != null ? reading.getWaterCost() : BigDecimal.ZERO);
        invoice.setTotal(total);

        Contract activeContract = contractRepository.findByStatus(ContractStatus.ACTIVE).stream()
                .filter(c -> c.getRoom().getId().equals(reading.getRoom().getId()))
                .findFirst()
                .orElse(null);
        if (activeContract != null) {
            invoice.setTenant(activeContract.getTenant());
        }
        return invoiceRepository.save(invoice);
    }
}
