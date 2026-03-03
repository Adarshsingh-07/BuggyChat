package com.substring.chat.service;
import com.substring.chat.entities.Message;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class RedisMessageSubscriber {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    public RedisMessageSubscriber(SimpMessagingTemplate messagingTemplate,
                                  ObjectMapper objectMapper) {
        this.messagingTemplate = messagingTemplate;
        this.objectMapper = objectMapper;
    }

    public void onMessage(String messageBody, String channel) {
        try {
            Message message = objectMapper.readValue(messageBody, Message.class);
            String roomId = channel.replace("chat.room.", "");
            messagingTemplate.convertAndSend("/topic/room/" + roomId, message);
        } catch (Exception e) {
            System.err.println("Error processing Redis message: " + e.getMessage());
        }
    }
}