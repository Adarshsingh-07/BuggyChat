package com.substring.chat.controllers;

import com.substring.chat.entities.Message;
import com.substring.chat.playload.MessageRequest;
import com.substring.chat.service.ChatService;
import com.substring.chat.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5500", "http://localhost:5500"})
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService, RoomService roomService) {
        this.chatService = chatService;
    }

    @MessageMapping("/sendMessage/{roomId}")
    public void sendMessage(
            @DestinationVariable String roomId,
            @Valid @RequestBody MessageRequest request
    ) {
        chatService.sendMessage(roomId, request);
    }
}