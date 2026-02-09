package com.motelmanagement.controller;

import com.motelmanagement.domain.Contract;
import com.motelmanagement.domain.ContractStatus;
import com.motelmanagement.domain.Room;
import com.motelmanagement.domain.RoomStatus;
import com.motelmanagement.domain.Tenant;
import com.motelmanagement.domain.User;
import com.motelmanagement.repository.ContractRepository;
import com.motelmanagement.repository.RoomRepository;
import com.motelmanagement.repository.TenantRepository;
import com.motelmanagement.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {
    private final ContractRepository contractRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;
    private final CurrentUserService currentUserService;

    public ContractController(ContractRepository contractRepository,
                              RoomRepository roomRepository,
                              TenantRepository tenantRepository,
                              CurrentUserService currentUserService) {
        this.contractRepository = contractRepository;
        this.roomRepository = roomRepository;
        this.tenantRepository = tenantRepository;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public List<Contract> list() {
        return contractRepository.findAll();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TENANT')")
    public List<Contract> myContracts() {
        User user = currentUserService.getCurrentUser();
        if (user == null) {
            return List.of();
        }
        Tenant tenant = tenantRepository.findByUserId(user.getId());
        if (tenant == null) {
            return List.of();
        }
        return contractRepository.findByTenantId(tenant.getId());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Contract> create(@RequestBody Contract contract) {
        if (contract.getRoom() == null || contract.getRoom().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (contract.getTenant() == null || contract.getTenant().getId() == null) {
            return ResponseEntity.badRequest().build();
        }
        Room room = roomRepository.findById(contract.getRoom().getId()).orElse(null);
        Tenant tenant = tenantRepository.findById(contract.getTenant().getId()).orElse(null);
        if (room == null || tenant == null) {
            return ResponseEntity.badRequest().build();
        }
        contract.setRoom(room);
        contract.setTenant(tenant);
        Contract saved = contractRepository.save(contract);
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/extend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Contract> extend(@PathVariable("id") Long id, @RequestBody Contract payload) {
        return contractRepository.findById(id)
                .map(existing -> {
                    existing.setEndDate(payload.getEndDate());
                    return ResponseEntity.ok(contractRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/end")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Contract> end(@PathVariable("id") Long id) {
        return contractRepository.findById(id)
                .map(existing -> {
                    existing.setStatus(ContractStatus.ENDED);
                    Contract saved = contractRepository.save(existing);
                    Room room = existing.getRoom();
                    if (room != null) {
                        room.setStatus(RoomStatus.AVAILABLE);
                        roomRepository.save(room);
                    }
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
