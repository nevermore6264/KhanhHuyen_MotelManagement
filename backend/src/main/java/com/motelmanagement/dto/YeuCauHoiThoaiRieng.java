package com.motelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class YeuCauHoiThoaiRieng {
    @NotBlank
    private String nguoiDungId;
}
