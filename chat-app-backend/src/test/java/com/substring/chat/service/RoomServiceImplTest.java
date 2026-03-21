package com.substring.chat.service;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.exceptions.RoomAlreadyExistsException;
import com.substring.chat.exceptions.RoomNotFoundException;
import com.substring.chat.playload.RoomCreateRequest;
import com.substring.chat.repositories.MessageRepository;
import com.substring.chat.repositories.RoomRepository;
import com.substring.chat.service.impl.RoomServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceImplTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private RoomServiceImpl roomService;

    private Room testRoom;

    @BeforeEach
    void setUp() {
        testRoom = new Room();
        testRoom.setRoomId("testroom");
    }

    @Test
    void createRoom_WhenRoomDoesNotExist_ReturnsCreatedRoom() {
        when(roomRepository.findByRoomId("testroom")).thenReturn(null);
        when(roomRepository.save(any(Room.class))).thenReturn(testRoom);

        Room result = roomService.createRoom("testroom");

        assertThat(result).isNotNull();
        assertThat(result.getRoomId()).isEqualTo("testroom");
        verify(roomRepository, times(1)).save(any(Room.class));
    }

    @Test
    void createRoom_WhenRoomAlreadyExists_ThrowsException() {
        when(roomRepository.findByRoomId("testroom")).thenReturn(testRoom);

        assertThatThrownBy(() -> roomService.createRoom("testroom"))
                .isInstanceOf(RoomAlreadyExistsException.class);
        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    void getRoom_WhenRoomExists_ReturnsRoom() {
        // Arrange
        when(roomRepository.findByRoomId("testroom")).thenReturn(testRoom);

        // Act
        Room result = roomService.getRoom("testroom");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getRoomId()).isEqualTo("testroom");
    }

    @Test
    void getRoom_WhenRoomNotFound_ThrowsException() {
        // Arrange
        when(roomRepository.findByRoomId("nonexistent")).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> roomService.getRoom("nonexistent"))
                .isInstanceOf(RoomNotFoundException.class);
    }

    @Test
    void getMessages_WhenRoomExists_ReturnsMessageList() {
        // Arrange
        Message msg1 = new Message();
        msg1.setId("1");
        msg1.setRoomId("testroom");
        msg1.setContent("Hello");
        msg1.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));


        Message msg2 = new Message();
        msg2.setId("2");
        msg2.setRoomId("testroom");
        msg2.setContent("World");
        msg2.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        when(roomRepository.findByRoomId("testroom")).thenReturn(testRoom);
        when(messageRepository.findByRoomIdOrderByTimestampDesc(eq("testroom"), any(Pageable.class)))
                .thenReturn(List.of(msg1, msg2));

        // Act
        List<Message> result = roomService.getMessages("testroom", 0, 10);

        // Assert
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getContent()).isEqualTo("Hello");
    }
    @Test
    void getMessages_WhenRoomNotFound_ThrowsException() {
        // Arrange
        when(roomRepository.findByRoomId("nonexistent")).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> roomService.getMessages("nonexistent", 0, 10))
                .isInstanceOf(RoomNotFoundException.class);
    }
}