package com.shuang.aiagent.tools.model;

public record TicketResponse(
        String ticketId,
        String status,
        String owner,
        String summary
) {
}

