package com.dersplatform.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewVerificationRequest {
    private boolean approved;
    private String adminNote;
}
