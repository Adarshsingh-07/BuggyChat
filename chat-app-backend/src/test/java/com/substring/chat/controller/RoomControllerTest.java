package com.substring.chat.controller;

import com.substring.chat.controllers.RoomController;
import com.substring.chat.entities.Room;
import com.substring.chat.exceptions.RoomAlreadyExistsException;
import com.substring.chat.exceptions.RoomNotFoundException;
import com.substring.chat.exceptions.GlobalExceptionHandler;
import com.substring.chat.service.RoomService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class RoomControllerTest {

    @Mock
    private RoomService roomService;

    @InjectMocks
    private RoomController roomController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(roomController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void createRoom_WhenValidRequest_Returns201() throws Exception {
        Room room = new Room();
        room.setRoomId("testroom");
        when(roomService.createRoom("testroom")).thenReturn(room);

        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roomId\":\"testroom\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomId").value("testroom"));
    }

    @Test
    void createRoom_WhenRoomAlreadyExists_Returns409() throws Exception {
        when(roomService.createRoom("testroom"))
                .thenThrow(new RoomAlreadyExistsException("testroom"));

        mockMvc.perform(post("/api/v1/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roomId\":\"testroom\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void getRoom_WhenRoomExists_Returns200() throws Exception {
        Room room = new Room();
        room.setRoomId("testroom");
        when(roomService.getRoom("testroom")).thenReturn(room);

        mockMvc.perform(get("/api/v1/rooms/testroom"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomId").value("testroom"));
    }

    @Test
    void getRoom_WhenRoomNotFound_Returns404() throws Exception {
        when(roomService.getRoom("nonexistent"))
                .thenThrow(new RoomNotFoundException("nonexistent"));

        mockMvc.perform(get("/api/v1/rooms/nonexistent"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getMessages_WhenRoomExists_Returns200() throws Exception {
        when(roomService.getMessages("testroom", 0, 20)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/rooms/testroom/messages"))
                .andExpect(status().isOk());
    }
}