package com.substring.chat.service.impl;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.playload.MessageRequest;
import com.substring.chat.repositories.MessageRepository;
import com.substring.chat.repositories.RoomRepository;
import com.substring.chat.service.ChatService;
import com.substring.chat.service.RedisMessagePublisher;
import com.substring.chat.service.RedisMessageSubscriber;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
@Service
public class ChatServiceImpl implements ChatService {

    private final RoomRepository roomRepository;
    private final MessageRepository messageRepository;
    private final RedisMessagePublisher redisMessagePublisher;
    private final RedisMessageListenerContainer listenerContainer;
    private final RedisMessageSubscriber redisMessageSubscriber;

    public ChatServiceImpl(RoomRepository roomRepository,
                           MessageRepository messageRepository,
                           RedisMessagePublisher redisMessagePublisher,
                           RedisMessageListenerContainer listenerContainer,
                           RedisMessageSubscriber redisMessageSubscriber) {
        this.roomRepository = roomRepository;
        this.messageRepository = messageRepository;
        this.redisMessagePublisher = redisMessagePublisher;
        this.listenerContainer = listenerContainer;
        this.redisMessageSubscriber = redisMessageSubscriber;
    }

    @Override
    public Message sendMessage(String roomId, MessageRequest request) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        Message message = new Message();
        message.setRoomId(roomId);
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimestamp(LocalDateTime.now());

        Message saved = messageRepository.save(message);

        // Subscribe to this room's Redis channel if not already
        String channel = "chat.room." + roomId;
        listenerContainer.addMessageListener(
                new MessageListenerAdapter(redisMessageSubscriber, "onMessage"),
                new PatternTopic(channel)
        );

        // Publish to Redis
        redisMessagePublisher.publish(roomId, saved);

        return saved;
    }
}