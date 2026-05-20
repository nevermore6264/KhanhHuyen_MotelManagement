package com.motelmanagement.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class YeuCauGuiTinChat {
    @Size(max = 2000)
    private String noiDung;
}
