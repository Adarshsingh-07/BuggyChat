package com.substring.chat.service.impl;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.repositories.RoomRepository;
import com.substring.chat.service.RoomService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomServiceImpl implements RoomService {
    private RoomRepository roomRepository;
    public RoomServiceImpl( RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
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
        roomRepository.save(room);
        return room;
    }
   public Room getRoom(String roomId){
       if(roomRepository.findByRoomId(roomId) == null){
           throw new RuntimeException("Room does not exist");
       }
       return roomRepository.findByRoomId(roomId);
   }
   public List<Message> getMessages(String roomId, int page, int size){
        Room room = getRoom(roomId);
        List<Message> messages = room.getMessages();
        int start =Math.max(0 , messages.size()-(page+1)*size);
        int end = Math.min(start + size, messages.size());
        return messages.subList(start, end);
   }
}
