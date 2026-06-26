package com.shuang.aiagent.tools.model;

import java.util.List;

public record ToolMetadata(
        String name,
        String description,
        List<String> requiredParameters
) {
}

