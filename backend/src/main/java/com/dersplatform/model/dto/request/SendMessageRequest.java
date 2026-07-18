package com.dersplatform.model.dto.request;

import com.dersplatform.model.enums.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class SendMessageRequest {
    @NotNull
    private UUID receiverId;

    @NotBlank
    @Size(max = 2000, message = "Mesaj en fazla 2000 karakter olabilir")
    private String content;

    private MessageType messageType;
}
