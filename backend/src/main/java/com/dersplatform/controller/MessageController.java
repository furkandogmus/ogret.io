package com.dersplatform.controller;

import com.dersplatform.model.dto.request.SendMessageRequest;
import com.dersplatform.model.dto.response.MessageResponse;
import com.dersplatform.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getConversation(
            @RequestParam UUID with,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID me = UUID.fromString(userDetails.getUsername());
        if (page == 0 && size >= 1000) {
            return ResponseEntity.ok(messageService.getConversation(me, with));
        }
        return ResponseEntity.ok(messageService.getConversationPage(me, with, page, size));
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.sendMessage(UUID.fromString(userDetails.getUsername()), request));
    }

    @GetMapping("/all")
    public ResponseEntity<List<MessageResponse>> getAllMessages(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                messageService.getAllMessages(UUID.fromString(userDetails.getUsername())));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<MessageResponse>> getUnread(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                messageService.getUnreadMessages(UUID.fromString(userDetails.getUsername())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        messageService.markAsRead(id, UUID.fromString(userDetails.getUsername()));
        return ResponseEntity.ok().build();
    }
}
