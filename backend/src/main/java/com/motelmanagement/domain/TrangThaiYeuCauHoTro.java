package com.motelmanagement.domain;

/** Trạng thái yêu cầu hỗ trợ: chờ xử lý, đang xử lý, đã xong. */
public enum TrangThaiYeuCauHoTro {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED
}
