package com.dtproduct.server.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "class_sessions")
public class ClassSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String schoolCode;
    private Integer grade;
    private Integer classNum;
    private Long teacherId;
    private Integer currentPage;
    private Boolean isActive; // 수업 중 여부
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public ClassSession() {}

    public ClassSession(Long id, String schoolCode, Integer grade, Integer classNum, Long teacherId, 
                        Integer currentPage, Boolean isActive, LocalDateTime startTime, LocalDateTime endTime) {
        this.id = id;
        this.schoolCode = schoolCode;
        this.grade = grade;
        this.classNum = classNum;
        this.teacherId = teacherId;
        this.currentPage = currentPage;
        this.isActive = isActive;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSchoolCode() { return schoolCode; }
    public void setSchoolCode(String schoolCode) { this.schoolCode = schoolCode; }
    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
    public Integer getClassNum() { return classNum; }
    public void setClassNum(Integer classNum) { this.classNum = classNum; }
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    public Integer getCurrentPage() { return currentPage; }
    public void setCurrentPage(Integer currentPage) { this.currentPage = currentPage; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public void start() {
        this.isActive = true;
        this.startTime = LocalDateTime.now();
        this.currentPage = 1;
    }

    public void stop() {
        this.isActive = false;
        this.endTime = LocalDateTime.now();
    }

    // Builder
    public static class ClassSessionBuilder {
        private Long id;
        private String schoolCode;
        private Integer grade;
        private Integer classNum;
        private Long teacherId;
        private Integer currentPage;
        private Boolean isActive;
        private LocalDateTime startTime;
        private LocalDateTime endTime;

        public ClassSessionBuilder id(Long id) { this.id = id; return this; }
        public ClassSessionBuilder schoolCode(String schoolCode) { this.schoolCode = schoolCode; return this; }
        public ClassSessionBuilder grade(Integer grade) { this.grade = grade; return this; }
        public ClassSessionBuilder classNum(Integer classNum) { this.classNum = classNum; return this; }
        public ClassSessionBuilder teacherId(Long teacherId) { this.teacherId = teacherId; return this; }
        public ClassSessionBuilder currentPage(Integer currentPage) { this.currentPage = currentPage; return this; }
        public ClassSessionBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public ClassSessionBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public ClassSessionBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public ClassSession build() {
            return new ClassSession(id, schoolCode, grade, classNum, teacherId, currentPage, isActive, startTime, endTime);
        }
    }

    public static ClassSessionBuilder builder() {
        return new ClassSessionBuilder();
    }
}
