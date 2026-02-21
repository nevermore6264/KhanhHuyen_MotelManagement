package com.motelmanagement.service;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.motelmanagement.domain.Contract;
import com.motelmanagement.domain.ContractStatus;
import com.motelmanagement.domain.Invoice;
import com.motelmanagement.domain.InvoiceStatus;
import com.motelmanagement.domain.MeterReading;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.InvoiceRepository;
import com.motelmanagement.repository.MeterReadingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillingService {
    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final InvoiceRepository invoiceRepository;
    private final ContractRepository contractRepository;
    private final MeterReadingRepository meterReadingRepository;

    public Invoice createOrUpdateInvoiceFromReading(MeterReading reading) {
        Invoice invoice = invoiceRepository
                .findByRoomIdAndMonthAndYear(reading.getRoom().getId(), reading.getMonth(), reading.getYear())
                .orElseGet(Invoice::new);

        invoice.setRoom(reading.getRoom());
        invoice.setMonth(reading.getMonth());
        invoice.setYear(reading.getYear());

        // Giá phòng lấy theo từng phòng (Room.currentPrice), không dùng bảng giá dịch vụ
        BigDecimal roomPrice = reading.getRoom().getCurrentPrice() != null
                ? reading.getRoom().getCurrentPrice() : BigDecimal.ZERO;
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

    /**
     * Job tự động: sinh hóa đơn cho tất cả phòng có hợp đồng ACTIVE trong tháng/năm chỉ định.
     * Nếu đã có hóa đơn (room, month, year) thì bỏ qua. Tiền phòng lấy từ Room.currentPrice,
     * tiền điện/nước lấy từ MeterReading nếu có, không có thì 0.
     */
    public int generateInvoicesForMonth(int month, int year) {
        List<Contract> activeContracts = contractRepository.findByStatus(ContractStatus.ACTIVE);
        int created = 0;
        for (Contract contract : activeContracts) {
            if (contract.getRoom() == null) continue;
            Long roomId = contract.getRoom().getId();
            if (invoiceRepository.findByRoomIdAndMonthAndYear(roomId, month, year).isPresent()) {
                continue;
            }
            Invoice invoice = new Invoice();
            invoice.setRoom(contract.getRoom());
            invoice.setTenant(contract.getTenant());
            invoice.setMonth(month);
            invoice.setYear(year);
            invoice.setStatus(InvoiceStatus.UNPAID);

            BigDecimal roomPrice = contract.getRoom().getCurrentPrice() != null
                    ? contract.getRoom().getCurrentPrice() : BigDecimal.ZERO;
            invoice.setRoomCost(roomPrice);

            invoice.setElectricityCost(BigDecimal.ZERO);
            invoice.setWaterCost(BigDecimal.ZERO);
            meterReadingRepository.findByRoomAndMonthAndYear(contract.getRoom(), month, year)
                    .ifPresent(reading -> {
                        if (reading.getElectricityCost() != null) {
                            invoice.setElectricityCost(reading.getElectricityCost());
                        }
                        if (reading.getWaterCost() != null) {
                            invoice.setWaterCost(reading.getWaterCost());
                        }
                    });

            BigDecimal total = roomPrice
                    .add(invoice.getElectricityCost())
                    .add(invoice.getWaterCost());
            invoice.setTotal(total);
            invoiceRepository.save(invoice);
            created++;
        }
        if (created > 0) {
            log.info("Invoice job: generated {} invoice(s) for {}/{}", created, month, year);
        }
        return created;
    }
}
