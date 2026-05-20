package com.motelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class YeuCauGuiTinNhan {
    @NotBlank
    @Size(max = 2000)
    private String noiDung;

    private String nguoiNhanId;

    private String phongId;
}
