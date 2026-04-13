package com.dtproduct.server.dto;

public class ClassEvent {
    
    private String type; // PAGE_MOVE, DRAW, SYNC_START, SYNC_END
    private Long sessionId;
    private String senderId;
    private Object payload; // 페이지 번호나 좌표 데이터 등

    public ClassEvent() {}

    public ClassEvent(String type, Long sessionId, String senderId, Object payload) {
        this.type = type;
        this.sessionId = sessionId;
        this.senderId = senderId;
        this.payload = payload;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public Object getPayload() { return payload; }
    public void setPayload(Object payload) { this.payload = payload; }

    // Builder
    public static class ClassEventBuilder {
        private String type;
        private Long sessionId;
        private String senderId;
        private Object payload;

        public ClassEventBuilder type(String type) { this.type = type; return this; }
        public ClassEventBuilder sessionId(Long sessionId) { this.sessionId = sessionId; return this; }
        public ClassEventBuilder senderId(String senderId) { this.senderId = senderId; return this; }
        public ClassEventBuilder payload(Object payload) { this.payload = payload; return this; }
        public ClassEvent build() {
            return new ClassEvent(type, sessionId, senderId, payload);
        }
    }

    public static ClassEventBuilder builder() {
        return new ClassEventBuilder();
    }
}
