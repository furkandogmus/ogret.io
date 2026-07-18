package com.dersplatform.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class ProfileCompletionResponse {
    private int score;
    private boolean complete;
    private int completedItems;
    private int totalItems;
    private List<Item> items;

    @Data
    @Builder
    @AllArgsConstructor
    public static class Item {
        private String key;
        private String label;
        private boolean completed;
    }
}
