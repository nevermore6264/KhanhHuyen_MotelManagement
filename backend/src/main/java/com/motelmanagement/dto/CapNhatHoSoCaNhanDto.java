package com.motelmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CapNhatHoSoCaNhanDto {
    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100)
    private String hoTen;

    @Size(max = 20)
    private String soDienThoai;

    @Size(max = 100)
    private String email;

    @Size(max = 50)
    private String soGiayTo;

    @Size(max = 200)
    private String diaChi;
}
