package com.substring.chat.repositories;

import com.substring.chat.entities.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;


import java.util.List;

public interface MessageRepository extends MongoRepository<Message,String> {
    List<Message> findByRoomIdOrderByTimestampDesc(String roomId, Pageable pageable);
}
