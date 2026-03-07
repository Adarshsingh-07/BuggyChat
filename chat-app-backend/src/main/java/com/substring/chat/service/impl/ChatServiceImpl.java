package com.substring.chat.service.impl;

import com.substring.chat.config.KafkaConfig;
import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.playload.MessageRequest;
import com.substring.chat.repositories.MessageRepository;
import com.substring.chat.repositories.RoomRepository;
import com.substring.chat.service.ChatService;
import com.substring.chat.service.RedisMessagePublisher;
import com.substring.chat.service.RedisMessageSubscriber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ChatServiceImpl implements ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);

    private final RoomRepository roomRepository;
    private final MessageRepository messageRepository;
    private final RedisMessagePublisher redisMessagePublisher;
    private final RedisMessageListenerContainer listenerContainer;
    private final RedisMessageSubscriber redisMessageSubscriber;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public ChatServiceImpl(RoomRepository roomRepository,
                           MessageRepository messageRepository,
                           RedisMessagePublisher redisMessagePublisher,
                           RedisMessageListenerContainer listenerContainer,
                           RedisMessageSubscriber redisMessageSubscriber,
                           KafkaTemplate<String, String> kafkaTemplate,
                           ObjectMapper objectMapper) {
        this.roomRepository = roomRepository;
        this.messageRepository = messageRepository;
        this.redisMessagePublisher = redisMessagePublisher;
        this.listenerContainer = listenerContainer;
        this.redisMessageSubscriber = redisMessageSubscriber;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public Message sendMessage(String roomId, MessageRequest request) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            throw new RuntimeException("Room not found");
        }

        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setRoomId(roomId);
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimestamp(LocalDateTime.now());

        // Subscribe to Redis channel for this room
        String channel = "chat.room." + roomId;
        MessageListenerAdapter adapter = new MessageListenerAdapter(redisMessageSubscriber, "onMessage");
        adapter.afterPropertiesSet();
        listenerContainer.addMessageListener(adapter, new PatternTopic(channel));
        log.debug("Subscribed to Redis channel [{}]", channel);

        // Publish to Redis immediately for instant delivery
        redisMessagePublisher.publish(roomId, message);
        log.debug("Message [{}] published to Redis channel [{}]", message.getId(), channel);

        // Publish to Kafka for async MongoDB persistence
        try {
            String messageJson = objectMapper.writeValueAsString(message);
            kafkaTemplate.send(KafkaConfig.CHAT_MESSAGES_TOPIC, roomId, messageJson);
            log.debug("Message [{}] published to Kafka topic [{}]", message.getId(), KafkaConfig.CHAT_MESSAGES_TOPIC);
        } catch (Exception e) {
            log.error("Failed to publish message [{}] to Kafka: {}", message.getId(), e.getMessage(), e);
        }

        return message;
    }
}