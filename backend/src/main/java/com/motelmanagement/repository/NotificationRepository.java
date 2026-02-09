package com.motelmanagement.repository;

import com.motelmanagement.domain.Notification;
import com.motelmanagement.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser(User user);
}
