package com.dersplatform.service;

import com.dersplatform.model.dto.request.SendMessageRequest;
import com.dersplatform.model.dto.response.MessageResponse;
import com.dersplatform.model.entity.Message;
import com.dersplatform.model.entity.User;
import com.dersplatform.model.enums.MessageType;
import com.dersplatform.repository.MessageRepository;
import com.dersplatform.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock private MessageRepository messageRepository;
    @Mock private UserRepository userRepository;

    private MessageService messageService;
    private User sender;
    private User receiver;
    private Message message;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        messageService = new MessageService(messageRepository, userRepository);

        sender = User.builder().id(UUID.randomUUID()).fullName("Alice").build();
        receiver = User.builder().id(UUID.randomUUID()).fullName("Bob").build();

        message = Message.builder()
                .id(UUID.randomUUID())
                .sender(sender)
                .receiver(receiver)
                .content("Merhaba!")
                .messageType(MessageType.TEXT)
                .isRead(false)
                .build();
    }

    @Test
    void sendMessage_ShouldCreateAndReturn() {
        when(userRepository.findById(sender.getId())).thenReturn(Optional.of(sender));
        when(userRepository.findById(receiver.getId())).thenReturn(Optional.of(receiver));
        when(messageRepository.save(any(Message.class))).thenReturn(message);

        var request = new SendMessageRequest();
        request.setReceiverId(receiver.getId());
        request.setContent("Merhaba!");

        MessageResponse response = messageService.sendMessage(sender.getId(), request);

        assertNotNull(response);
        assertEquals("Merhaba!", response.getContent());
        assertEquals(sender.getId(), response.getSenderId());
        assertEquals(receiver.getId(), response.getReceiverId());
        assertFalse(response.isRead());

        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void getConversation_ShouldReturnOrderedMessages() {
        when(messageRepository.findConversation(sender.getId(), receiver.getId()))
                .thenReturn(List.of(message));

        var messages = messageService.getConversation(sender.getId(), receiver.getId());

        assertEquals(1, messages.size());
        assertEquals("Merhaba!", messages.get(0).getContent());
    }

    @Test
    void markAsRead_ShouldUpdateStatus() {
        when(messageRepository.findById(message.getId())).thenReturn(Optional.of(message));

        messageService.markAsRead(message.getId(), receiver.getId());

        assertTrue(message.isRead());
        verify(messageRepository).save(message);
    }

    @Test
    void markAsRead_ShouldNotUpdate_whenNotReceiver() {
        when(messageRepository.findById(message.getId())).thenReturn(Optional.of(message));

        messageService.markAsRead(message.getId(), sender.getId());

        assertFalse(message.isRead());
        verify(messageRepository, never()).save(any());
    }

    @Test
    void getUnreadMessages_ShouldReturnList() {
        when(messageRepository.findUnreadMessages(receiver.getId()))
                .thenReturn(List.of(message));

        var unread = messageService.getUnreadMessages(receiver.getId());

        assertEquals(1, unread.size());
    }
}
