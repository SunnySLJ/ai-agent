package com.shuang.aiagent.tools.api;

import com.shuang.aiagent.tools.core.BusinessToolException;
import com.shuang.aiagent.tools.core.BusinessToolService;
import com.shuang.aiagent.tools.model.AuditEventsResponse;
import com.shuang.aiagent.tools.model.CreateTodoRequest;
import com.shuang.aiagent.tools.model.ErrorResponse;
import com.shuang.aiagent.tools.model.OrderResponse;
import com.shuang.aiagent.tools.model.TicketResponse;
import com.shuang.aiagent.tools.model.TodoResponse;
import com.shuang.aiagent.tools.model.ToolListResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class BusinessToolController {
    private final BusinessToolService service;

    public BusinessToolController(BusinessToolService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/tools")
    public ToolListResponse tools() {
        return service.tools();
    }

    @GetMapping("/orders/{orderId}")
    public OrderResponse order(@PathVariable String orderId) {
        return service.order(orderId);
    }

    @GetMapping("/tickets/{ticketId}")
    public TicketResponse ticket(@PathVariable String ticketId) {
        return service.ticket(ticketId);
    }

    @PostMapping("/todos")
    public TodoResponse createTodo(@Valid @RequestBody CreateTodoRequest request) {
        return service.createTodo(request);
    }

    @GetMapping("/audit-events")
    public AuditEventsResponse auditEvents() {
        return service.auditEvents();
    }

    @ExceptionHandler(BusinessToolException.class)
    public ResponseEntity<ErrorResponse> handleBusinessToolException(BusinessToolException exception) {
        return ResponseEntity
                .status(exception.status())
                .body(new ErrorResponse(exception.code(), exception.getMessage()));
    }
}

