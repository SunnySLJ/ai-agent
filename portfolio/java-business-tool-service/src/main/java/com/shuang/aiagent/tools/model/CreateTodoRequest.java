package com.shuang.aiagent.tools.model;

import jakarta.validation.constraints.NotBlank;

public record CreateTodoRequest(
        @NotBlank String title,
        @NotBlank String idempotencyKey
) {
}

