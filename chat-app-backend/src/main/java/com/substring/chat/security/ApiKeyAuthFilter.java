package com.substring.chat.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-KEY";
    @Value("${app.security.api-key}")
    private String secretKey;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String apiKey = request.getHeader(API_KEY_HEADER);

        // Allow WebSocket handshake and actuator later (we'll refine)
        String path = request.getRequestURI();
        if (path.startsWith("/ws") || path.startsWith("/topic") || path.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (secretKey.equals(apiKey)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.getWriter().write("Unauthorized: Invalid API Key");
        }
    }
}