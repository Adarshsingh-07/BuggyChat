package com.substring.chat.service.impl;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.repositories.MessageRepository;
import com.substring.chat.repositories.RoomRepository;
import com.substring.chat.service.RoomService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    private final MessageRepository messageRepository;
    public RoomServiceImpl( RoomRepository roomRepository , MessageRepository messageRepository) {
        this.roomRepository = roomRepository;
        this.messageRepository = messageRepository;
    }


    public Room findRoomById(String roomId){
        return roomRepository.findByRoomId(roomId);
    }

    @Override
    public Room createRoom(String roomId) {
        if(roomRepository.findByRoomId(roomId) != null){
            throw new RuntimeException("Room already exists");
        }
        Room room = new Room();
        room.setRoomId(roomId);
        return roomRepository.save(room);

    }
   public Room getRoom(String roomId){
        Room room = roomRepository.findByRoomId(roomId);
       if( room == null){
           throw new RuntimeException("Room does not exist");
       }
       return room;
   }
   @Override
   public List<Message> getMessages(String roomId, int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        Room room = getRoom(roomId);

        return messageRepository.findByRoomIdOrderByTimestampDesc(roomId, pageable);
   }
}
