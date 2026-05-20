package com.motelmanagement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.motelmanagement.domain.TinNhan;
import com.motelmanagement.dto.YeuCauGuiTinNhan;
import com.motelmanagement.service.TinNhanService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/tin-nhan")
public class TinNhanController {
    private final TinNhanService tinNhanService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public List<TinNhan> layDanhSach() {
        return tinNhanService.layTinNhan();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public ResponseEntity<TinNhan> gui(@Valid @RequestBody YeuCauGuiTinNhan yeuCau) {
        return ResponseEntity.ok(tinNhanService.gui(yeuCau));
    }

    @PutMapping("/{id}/da-doc")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public ResponseEntity<Void> danhDauDaDoc(@PathVariable("id") String id) {
        tinNhanService.danhDauDaDoc(id);
        return ResponseEntity.ok().build();
    }
}
