package com.substring.chat.service;

import com.substring.chat.entities.Message;
import com.substring.chat.repositories.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class KafkaMessageConsumer {

    private static final Logger log = LoggerFactory.getLogger(KafkaMessageConsumer.class);

    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    public KafkaMessageConsumer(MessageRepository messageRepository,
                                ObjectMapper objectMapper) {
        this.messageRepository = messageRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "chat-messages", groupId = "chat-group")
    public void consume(String messageJson) {
        log.debug("Received message from Kafka topic [chat-messages]: {}", messageJson);
        try {
            Message message = objectMapper.readValue(messageJson, Message.class);
            messageRepository.save(message);
            log.info("Message [{}] persisted to MongoDB for room [{}]", message.getId(), message.getRoomId());
        } catch (Exception e) {
            log.error("Failed to process Kafka message: {}", e.getMessage(), e);
        }
    }
}