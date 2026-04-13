package com.dtproduct.server.controller;

import com.dtproduct.server.dto.ClassEvent;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
public class ClassroomController {

    private static final Logger log = LoggerFactory.getLogger(ClassroomController.class);

    /**
     * 특정 수업 세션(sessionId)으로 들어온 메시지를 해당 토픽 구독자에게 브로드캐스트
     */
    @MessageMapping("/class/{sessionId}/sync")
    @SendTo("/topic/class/{sessionId}/sync")
    public ClassEvent broadcastSyncEvent(@DestinationVariable Long sessionId, ClassEvent event) {
        log.debug("Classroom Event Received: Session ID={}, Type={}, Payload={}", sessionId, event.getType(), event.getPayload());
        
        return event;
    }
}
