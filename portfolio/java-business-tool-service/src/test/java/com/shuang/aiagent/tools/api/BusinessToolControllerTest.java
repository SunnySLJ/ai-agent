package com.shuang.aiagent.tools.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class BusinessToolControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsToolMetadataWithParameterSchemas() throws Exception {
        mockMvc.perform(get("/tools"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tools", hasSize(3)))
                .andExpect(jsonPath("$.tools[0].name", is("get_order_status")))
                .andExpect(jsonPath("$.tools[0].requiredParameters[0]", is("orderId")));
    }

    @Test
    void returnsKnownOrderAndRecordsAuditEvent() throws Exception {
        mockMvc.perform(get("/orders/ORD-1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId", is("ORD-1001")))
                .andExpect(jsonPath("$.status", is("shipped")))
                .andExpect(jsonPath("$.eta", is("tomorrow")));

        mockMvc.perform(get("/audit-events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.events[0].toolName", is("get_order_status")))
                .andExpect(jsonPath("$.events[0].targetId", is("ORD-1001")))
                .andExpect(jsonPath("$.events[0].success", is(true)));
    }

    @Test
    void returnsKnownTicketAndRecordsAuditEvent() throws Exception {
        mockMvc.perform(get("/tickets/TCK-1001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ticketId", is("TCK-1001")))
                .andExpect(jsonPath("$.status", is("processing")));

        mockMvc.perform(get("/audit-events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.events[0].toolName", is("get_ticket_status")))
                .andExpect(jsonPath("$.events[0].targetId", is("TCK-1001")));
    }

    @Test
    void createsTodoIdempotentlyAndRecordsSingleCreationAudit() throws Exception {
        String body = """
                {"title":"Follow up customer","idempotencyKey":"idem-1"}
                """;

        mockMvc.perform(post("/todos").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.todoId", is("TODO-1")))
                .andExpect(jsonPath("$.status", is("created")));

        mockMvc.perform(post("/todos").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.todoId", is("TODO-1")))
                .andExpect(jsonPath("$.status", is("created")));

        mockMvc.perform(get("/audit-events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.events", hasSize(1)))
                .andExpect(jsonPath("$.events[0].toolName", is("create_todo")))
                .andExpect(jsonPath("$.events[0].targetId", is("TODO-1")));
    }

    @Test
    void returnsStructuredNotFoundForUnknownOrder() throws Exception {
        mockMvc.perform(get("/orders/ORD-404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code", is("ORDER_NOT_FOUND")))
                .andExpect(jsonPath("$.message", is("Order ORD-404 was not found")));
    }
}
