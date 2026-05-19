package com.motelmanagement.config;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;


@RestControllerAdvice
public class XuLyNgoaiLeBaoMat {

    @ExceptionHandler({AuthorizationDeniedException.class, AccessDeniedException.class})
    public ResponseEntity<Void> tuChoiTruyCap(RuntimeException ignored) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> loiNghiepVu(IllegalArgumentException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Yeu cau khong hop le.";
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }
}
