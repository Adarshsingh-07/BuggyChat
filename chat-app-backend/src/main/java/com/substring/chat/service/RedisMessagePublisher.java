package com.substring.chat.service;

import com.substring.chat.entities.Message;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

@Service
public class RedisMessagePublisher {

    private final RedisTemplate<String, Message> redisTemplate;

    public RedisMessagePublisher(RedisTemplate<String, Message> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void publish(String roomId, Message message) {
        String channel = "chat.room." + roomId;
        redisTemplate.convertAndSend(channel, message);
    }
}