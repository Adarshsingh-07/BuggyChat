package com.substring.chat.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // keep modest for testing; later configurable
    private static final int MAX_REQUESTS_PER_MINUTE = 60;

    private final Map<String, RequestWindow> requestCounts = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // allow websocket handshake freely
        String path = request.getRequestURI();
        if (path.startsWith("/ws") || path.startsWith("/topic") || path.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader("X-API-KEY");
        String clientKey = (apiKey != null) ? apiKey : request.getRemoteAddr();

        long now = Instant.now().getEpochSecond();

        RequestWindow window = requestCounts.computeIfAbsent(
                clientKey,
                k -> new RequestWindow(now, 0)
        );

        synchronized (window) {

            // reset window every 60 seconds
            if (now - window.windowStart >= 60) {
                window.windowStart = now;
                window.requestCount = 0;
            }

            window.requestCount++;

            if (window.requestCount > MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too Many Requests");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private static class RequestWindow {
        long windowStart;
        int requestCount;

        RequestWindow(long windowStart, int requestCount) {
            this.windowStart = windowStart;
            this.requestCount = requestCount;
        }
    }
}