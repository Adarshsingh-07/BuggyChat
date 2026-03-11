package com.substring.chat.service;

import com.substring.chat.config.KafkaConfig;
import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.playload.MessageRequest;
import com.substring.chat.repositories.MessageRepository;
import com.substring.chat.repositories.RoomRepository;
import com.substring.chat.service.impl.ChatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.kafka.core.KafkaTemplate;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceImplTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private RedisMessagePublisher redisMessagePublisher;

    @Mock
    private RedisMessageListenerContainer listenerContainer;

    @Mock
    private RedisMessageSubscriber redisMessageSubscriber;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ChatServiceImpl chatService;

    private Room testRoom;
    private MessageRequest testRequest;

    @BeforeEach
    void setUp() {
        testRoom = new Room();
        testRoom.setRoomId("testroom");

        testRequest = new MessageRequest();
        testRequest.setContent("Hello!");
        testRequest.setSender("testuser");
    }

    @Test
    void sendMessage_WhenRoomExists_ReturnsMessage() throws Exception {
        // Arrange
        when(roomRepository.findByRoomId("testroom")).thenReturn(testRoom);
        when(objectMapper.writeValueAsString(any(Message.class))).thenReturn("{\"id\":\"123\"}");

        // Act
        Message result = chatService.sendMessage("testroom", testRequest);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getRoomId()).isEqualTo("testroom");
        assertThat(result.getContent()).isEqualTo("Hello!");
        assertThat(result.getSender()).isEqualTo("testuser");
        assertThat(result.getId()).isNotNull();
        assertThat(result.getTimestamp()).isNotNull();
    }

    @Test
    void sendMessage_WhenRoomNotFound_ThrowsException() {
        // Arrange
        when(roomRepository.findByRoomId("nonexistent")).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> chatService.sendMessage("nonexistent", testRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Room not found");
    }

    @Test
    void sendMessage_WhenRoomExists_PublishesToRedis() throws Exception {
        // Arrange
        when(roomRepository.findByRoomId("testroom")).thenReturn(testRoom);
        when(objectMapper.writeValueAsString(any(Message.class))).thenReturn("{\"id\":\"123\"}");

        // Act
        chatService.sendMessage("testroom", testRequest);

        // Assert
        verify(redisMessagePublisher, times(1)).publish(eq("testroom"), any(Message.class));
    }

    @Test
    void sendMessage_WhenRoomExists_PublishesToKafka() throws Exception {
        // Arrange
        when(roomRepository.findByRoomId("testroom")).thenReturn(testRoom);
        when(objectMapper.writeValueAsString(any(Message.class))).thenReturn("{\"id\":\"123\"}");

        // Act
        chatService.sendMessage("testroom", testRequest);

        // Assert
        verify(kafkaTemplate, times(1)).send(
                eq(KafkaConfig.CHAT_MESSAGES_TOPIC),
                eq("testroom"),
                eq("{\"id\":\"123\"}")
        );
    }
}