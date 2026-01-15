package com.substring.chat.service;

import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;

import java.util.List;

public interface RoomService {
    Room findRoomById(String roomId);
    Room createRoom(String roomId);
    Room getRoom(String roomId);
    List<Message> getMessages(String roomId, int page, int size);
}
