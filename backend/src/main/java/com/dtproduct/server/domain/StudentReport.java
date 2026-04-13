package com.dtproduct.server.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_reports")
public class StudentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer studentNumber;
    private String studentName;
    private Long bookId;
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String solvedQuestions; 

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    private Integer score;
    private Double completionRate;
    private LocalDateTime createdAt;

    public StudentReport() {}

    public StudentReport(Long id, Integer studentNumber, String studentName, Long bookId, String subject, 
                         String solvedQuestions, String aiFeedback, Integer score, Double completionRate, LocalDateTime createdAt) {
        this.id = id;
        this.studentNumber = studentNumber;
        this.studentName = studentName;
        this.bookId = bookId;
        this.subject = subject;
        this.solvedQuestions = solvedQuestions;
        this.aiFeedback = aiFeedback;
        this.score = score;
        this.completionRate = completionRate;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getStudentNumber() { return studentNumber; }
    public void setStudentNumber(Integer studentNumber) { this.studentNumber = studentNumber; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getSolvedQuestions() { return solvedQuestions; }
    public void setSolvedQuestions(String solvedQuestions) { this.solvedQuestions = solvedQuestions; }
    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Double getCompletionRate() { return completionRate; }
    public void setCompletionRate(Double completionRate) { this.completionRate = completionRate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static class StudentReportBuilder {
        private Long id;
        private Integer studentNumber;
        private String studentName;
        private Long bookId;
        private String subject;
        private String solvedQuestions;
        private String aiFeedback;
        private Integer score;
        private Double completionRate;
        private LocalDateTime createdAt;

        public StudentReportBuilder id(Long id) { this.id = id; return this; }
        public StudentReportBuilder studentNumber(Integer studentNumber) { this.studentNumber = studentNumber; return this; }
        public StudentReportBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public StudentReportBuilder bookId(Long bookId) { this.bookId = bookId; return this; }
        public StudentReportBuilder subject(String subject) { this.subject = subject; return this; }
        public StudentReportBuilder solvedQuestions(String solvedQuestions) { this.solvedQuestions = solvedQuestions; return this; }
        public StudentReportBuilder aiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; return this; }
        public StudentReportBuilder score(Integer score) { this.score = score; return this; }
        public StudentReportBuilder completionRate(Double completionRate) { this.completionRate = completionRate; return this; }
        public StudentReportBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public StudentReport build() {
            return new StudentReport(id, studentNumber, studentName, bookId, subject, solvedQuestions, aiFeedback, score, completionRate, createdAt);
        }
    }

    public static StudentReportBuilder builder() {
        return new StudentReportBuilder();
    }
}
