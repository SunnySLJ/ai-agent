package com.shuang.aiagent.tools.model;

import java.time.Instant;

public record AuditEvent(
        String eventId,
        String toolName,
        String targetId,
        boolean success,
        Instant createdAt
) {
}

