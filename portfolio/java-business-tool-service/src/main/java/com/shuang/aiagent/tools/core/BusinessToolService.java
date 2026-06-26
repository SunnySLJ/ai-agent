package com.shuang.aiagent.tools.core;

import com.shuang.aiagent.tools.model.AuditEvent;
import com.shuang.aiagent.tools.model.AuditEventsResponse;
import com.shuang.aiagent.tools.model.CreateTodoRequest;
import com.shuang.aiagent.tools.model.OrderResponse;
import com.shuang.aiagent.tools.model.TicketResponse;
import com.shuang.aiagent.tools.model.TodoResponse;
import com.shuang.aiagent.tools.model.ToolListResponse;
import com.shuang.aiagent.tools.model.ToolMetadata;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class BusinessToolService {
    private final Map<String, OrderResponse> orders = new LinkedHashMap<>();
    private final Map<String, TicketResponse> tickets = new LinkedHashMap<>();
    private final Map<String, TodoResponse> todosByIdempotencyKey = new LinkedHashMap<>();
    private final List<AuditEvent> auditEvents = new ArrayList<>();
    private final AtomicInteger auditSequence = new AtomicInteger();
    private final AtomicInteger todoSequence = new AtomicInteger();

    public BusinessToolService() {
        orders.put("ORD-1001", new OrderResponse(
                "ORD-1001",
                "shipped",
                "tomorrow",
                "订单 ORD-1001 当前状态：已发货，预计明日送达。"
        ));
        tickets.put("TCK-1001", new TicketResponse(
                "TCK-1001",
                "processing",
                "support-team",
                "工单 TCK-1001 当前状态：处理中。"
        ));
    }

    public ToolListResponse tools() {
        return new ToolListResponse(List.of(
                new ToolMetadata("get_order_status", "Query order status by orderId.", List.of("orderId")),
                new ToolMetadata("get_ticket_status", "Query ticket status by ticketId.", List.of("ticketId")),
                new ToolMetadata("create_todo", "Create an idempotent todo item.", List.of("title", "idempotencyKey"))
        ));
    }

    public synchronized OrderResponse order(String orderId) {
        OrderResponse response = orders.get(orderId);
        if (response == null) {
            record("get_order_status", orderId, false);
            throw new BusinessToolException(
                    "ORDER_NOT_FOUND",
                    "Order " + orderId + " was not found",
                    HttpStatus.NOT_FOUND
            );
        }
        record("get_order_status", orderId, true);
        return response;
    }

    public synchronized TicketResponse ticket(String ticketId) {
        TicketResponse response = tickets.get(ticketId);
        if (response == null) {
            record("get_ticket_status", ticketId, false);
            throw new BusinessToolException(
                    "TICKET_NOT_FOUND",
                    "Ticket " + ticketId + " was not found",
                    HttpStatus.NOT_FOUND
            );
        }
        record("get_ticket_status", ticketId, true);
        return response;
    }

    public synchronized TodoResponse createTodo(CreateTodoRequest request) {
        TodoResponse existing = todosByIdempotencyKey.get(request.idempotencyKey());
        if (existing != null) {
            return existing;
        }
        TodoResponse created = new TodoResponse(
                "TODO-" + todoSequence.incrementAndGet(),
                request.title(),
                "created"
        );
        todosByIdempotencyKey.put(request.idempotencyKey(), created);
        record("create_todo", created.todoId(), true);
        return created;
    }

    public synchronized AuditEventsResponse auditEvents() {
        return new AuditEventsResponse(List.copyOf(auditEvents));
    }

    private void record(String toolName, String targetId, boolean success) {
        auditEvents.add(new AuditEvent(
                "AUD-" + auditSequence.incrementAndGet(),
                toolName,
                targetId,
                success,
                Instant.now()
        ));
    }
}

