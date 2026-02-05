package com.substring.chat.service.impl;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.playload.MessageRequest;
import com.substring.chat.repositories.MessageRepository;
import com.substring.chat.repositories.RoomRepository;
import com.substring.chat.service.ChatService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ChatServiceImpl implements ChatService {
   private final RoomRepository roomRepository;

   private final MessageRepository messageRepository;
   public ChatServiceImpl(RoomRepository roomRepository , MessageRepository messageRepository) {
       this.roomRepository = roomRepository;
       this.messageRepository = messageRepository;
   }
   @Override
    public Message sendMessage(String roomId, MessageRequest request){
        Room room = roomRepository.findByRoomId(roomId);

        if(room == null){
            throw new RuntimeException("Room not found");
        }
        Message message = new Message();
        message.setRoomId(roomId);
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimestamp(LocalDateTime.now());
        return messageRepository.save(message);

    }

}
