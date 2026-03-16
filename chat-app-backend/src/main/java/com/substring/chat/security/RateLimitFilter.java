package com.substring.chat.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final int MAX_REQUESTS_PER_MINUTE = 60;
    private static final int WINDOW_SECONDS = 60;

    private final StringRedisTemplate redisTemplate;

    public RateLimitFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/ws") || path.startsWith("/topic")
                || path.startsWith("/actuator") || path.startsWith("/chat")) {
            filterChain.doFilter(request, response);
            return;
        }

        String apiKey = request.getHeader("X-API-KEY");
        String clientKey = (apiKey != null) ? apiKey : request.getRemoteAddr();
        String redisKey = "rate_limit:" + clientKey;

        long now = Instant.now().toEpochMilli();
        long windowStart = now - (WINDOW_SECONDS * 1000L);

        // Remove entries outside the sliding window
        redisTemplate.opsForZSet().removeRangeByScore(redisKey, 0, windowStart);

        // Count requests in current window
        Long requestCount = redisTemplate.opsForZSet().zCard(redisKey);

        if (requestCount != null && requestCount >= MAX_REQUESTS_PER_MINUTE) {
            log.warn("Rate limit exceeded for client [{}]", clientKey);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Too Many Requests");
            return;
        }

        // Add current request to the sorted set with timestamp as score
        redisTemplate.opsForZSet().add(redisKey, String.valueOf(now), now);

        // Set key expiry to auto-cleanup after window expires
        redisTemplate.expire(redisKey, WINDOW_SECONDS * 2L, TimeUnit.SECONDS);

        filterChain.doFilter(request, response);
    }
}