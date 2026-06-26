package com.shuang.aiagent.tools.core;

import org.springframework.http.HttpStatus;

public class BusinessToolException extends RuntimeException {
    private final String code;
    private final HttpStatus status;

    public BusinessToolException(String code, String message, HttpStatus status) {
        super(message);
        this.code = code;
        this.status = status;
    }

    public String code() {
        return code;
    }

    public HttpStatus status() {
        return status;
    }
}

