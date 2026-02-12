package com.motelmanagement.service;

import com.motelmanagement.domain.SystemLog;
import com.motelmanagement.domain.User;
import com.motelmanagement.repository.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LogService {
    private final SystemLogRepository systemLogRepository;

    public void log(User actor, String action, String entityType, String entityId, String detail) {
        SystemLog log = new SystemLog();
        log.setActor(actor);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetail(detail);
        systemLogRepository.save(log);
    }
}
