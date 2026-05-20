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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.motelmanagement.dto.DtoHoiThoai;
import com.motelmanagement.dto.DtoTinNhanChat;
import com.motelmanagement.dto.YeuCauGuiTinChat;
import com.motelmanagement.dto.YeuCauHoiThoaiRieng;
import com.motelmanagement.dto.YeuCauPhanHoi;
import com.motelmanagement.service.HoiThoaiService;
import com.motelmanagement.service.TinNhanChatService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/hoi-thoai")
public class HoiThoaiController {
    private final HoiThoaiService hoiThoaiService;
    private final TinNhanChatService tinNhanChatService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public List<DtoHoiThoai> layDanhSach() {
        return hoiThoaiService.layDanhSach();
    }

    @PostMapping("/rieng")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public DtoHoiThoai taoRieng(@Valid @RequestBody YeuCauHoiThoaiRieng yeuCau) {
        return hoiThoaiService.taoHoacLayRieng(yeuCau.getNguoiDungId());
    }

    @GetMapping("/{id}/tin-nhan")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public List<DtoTinNhanChat> layTin(@PathVariable("id") String id) {
        return tinNhanChatService.layTinTrongHoiThoai(id);
    }

    @PostMapping("/{id}/tin-nhan")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public DtoTinNhanChat guiTin(
            @PathVariable("id") String id,
            @Valid @RequestBody YeuCauGuiTinChat yeuCau) {
        return tinNhanChatService.guiVanBan(id, yeuCau);
    }

    @PostMapping("/{id}/tin-nhan/upload")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public DtoTinNhanChat guiFile(
            @PathVariable("id") String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "noiDung", required = false) String noiDung) {
        return tinNhanChatService.guiFile(id, file, noiDung);
    }

    @PutMapping("/{id}/da-doc")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public ResponseEntity<Void> danhDauDaDoc(@PathVariable("id") String id) {
        tinNhanChatService.danhDauDaDocHoiThoai(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tin-nhan/{tinId}/phan-hoi")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF','TENANT')")
    public DtoTinNhanChat phanHoi(
            @PathVariable("tinId") String tinId,
            @Valid @RequestBody YeuCauPhanHoi yeuCau) {
        return tinNhanChatService.togglePhanHoi(tinId, yeuCau.getEmoji());
    }
}
