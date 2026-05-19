package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class NotificationCreateDto {
    private String message;

    private String userId;
}
