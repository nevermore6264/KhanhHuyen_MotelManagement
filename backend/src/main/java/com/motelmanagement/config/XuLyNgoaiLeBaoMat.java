package com.motelmanagement.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Chuyển từ chối quyền ({@code @PreAuthorize}) thành HTTP 403.
 * Spring Security 6.3+ có thể ném {@link AuthorizationDeniedException} thay vì chỉ {@link AccessDeniedException}.
 */
@RestControllerAdvice
public class XuLyNgoaiLeBaoMat {

    @ExceptionHandler({AuthorizationDeniedException.class, AccessDeniedException.class})
    public ResponseEntity<Void> tuChoiTruyCap(RuntimeException ignored) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }
}
