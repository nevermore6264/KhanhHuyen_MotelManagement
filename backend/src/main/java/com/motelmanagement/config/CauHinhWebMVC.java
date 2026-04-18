package com.motelmanagement.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Cấu hình Web MVC
 */
@Configuration
public class CauHinhWebMVC implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String duongDanThuMuc;

    /**
     * Cho phép FE kết nối từ cổng *
     *
     * @param registry CorsRegistry
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://localhost:*",
                        "https://127.0.0.1:*")
                .allowCredentials(true)
                .allowedMethods("*")
                .allowedHeaders("*");
    }

    /**
     * Cấu hình đường dẫn lưu file
     *
     * @param registry ResourceHandlerRegistry
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(duongDanThuMuc).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/tenant-files/**")
                .addResourceLocations(location);
    }
}
