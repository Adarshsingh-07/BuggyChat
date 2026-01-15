package com.substring.chat.controllers;


import com.substring.chat.entities.Message;
import com.substring.chat.entities.Room;
import com.substring.chat.repositories.RoomRepository;
import com.substring.chat.service.RoomService;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class RoomController {

    private final RoomService roomService;
    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }
    // CREATE ROOM
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId) {
        Room room = roomService.createRoom(roomId);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }
    // GET ROOM
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(roomService.getRoom(roomId));
    }

    //GET MESSAGES OF ROOM
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String roomId ,@RequestParam(value = "page" , defaultValue = "0", required = false)int page, @RequestParam(value = "size", defaultValue = "20", required = false)int size){
        return ResponseEntity.ok(roomService.getMessages(roomId,page,size));
    }

}
