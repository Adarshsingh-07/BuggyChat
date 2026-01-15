package com.substring.chat.service;

import com.substring.chat.entities.Message;
//import com.substring.chat.entities.Room;
import com.substring.chat.playload.MessageRequest;
import org.springframework.web.bind.annotation.RequestBody;

public interface ChatService {
    Message sendMessage(String roomId, MessageRequest request);

}
