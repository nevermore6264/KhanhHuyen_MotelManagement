package com.motelmanagement.logging;

import com.motelmanagement.domain.User;
import com.motelmanagement.service.CurrentUserService;
import com.motelmanagement.service.LogService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class ApiLoggingFilter extends OncePerRequestFilter {
    private final LogService logService;
    private final CurrentUserService currentUserService;
    private final Set<String> methods = Set.of("POST", "PUT", "DELETE");

    public ApiLoggingFilter(LogService logService, CurrentUserService currentUserService) {
        this.logService = logService;
        this.currentUserService = currentUserService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        filterChain.doFilter(request, response);
        String method = request.getMethod();
        if (!methods.contains(method)) {
            return;
        }
        String path = request.getRequestURI();
        User actor = currentUserService.getCurrentUser();
        logService.log(actor, method, "API", null, "Request to " + path);
    }
}
