package com.dersplatform.model.dto.request;

import com.dersplatform.model.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SendMessageRequest {
    @NotNull
    private UUID receiverId;

    @NotBlank
    private String content;

    private MessageType messageType;
}
