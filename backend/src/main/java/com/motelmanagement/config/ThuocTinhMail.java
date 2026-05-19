package com.motelmanagement.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;


@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.mail")
public class ThuocTinhMail {
    private String from = "noreply@motel.local";
}
