package com.substring.chat.controllers;

import com.substring.chat.entities.Message;
import com.substring.chat.playload.MessageRequest;
import com.substring.chat.service.ChatService;
import com.substring.chat.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Controller
@CrossOrigin("http://localhost:5173")
public class ChatController {

       private final ChatService chatService;
       public ChatController(ChatService chatService , RoomService roomService) {
            this.chatService = chatService;
        }
        @MessageMapping("/sendMessage/{roomId}")
        @SendTo("/topic/room/{roomId}")
       public Message sendMessage(
            @DestinationVariable String roomId,
           @Valid @RequestBody MessageRequest request
             ) {
          return chatService.sendMessage(roomId, request);
         }
}
