package com.shuang.aiagent.tools.model;

public record OrderResponse(
        String orderId,
        String status,
        String eta,
        String summary
) {
}

