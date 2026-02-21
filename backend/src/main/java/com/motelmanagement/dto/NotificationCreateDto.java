package com.motelmanagement.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationCreateDto {
    private String message;
    /** Null = gửi cho tất cả user. Có giá trị = gửi cho user đó. */
    private Long userId;
}
