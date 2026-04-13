package com.dtproduct.server.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer studentNumber; // 학생 출석 번호

    @Column(nullable = false)
    private String name; // 학생 이름

    private Integer grade; // 학년 (선생님의 class_num에서 참조)
    private Integer classNum; // 반 (선생님의 grade에서 참조)
    
    @Column(nullable = false)
    private String schoolName; // 학교명

    private String teacherName; // 담임 선생님 성함
    private Long teacherId; // 담임 선생님 고유 ID (동명이인 방지용)

    private String password; // 학생 비밀번호 추가
    
    @Column(nullable = false)
    private String status = "재학"; // 기본값: 재학

    public Student() {}

    public Student(Long id, Integer studentNumber, String name, Integer grade, Integer classNum, String schoolName, String teacherName, Long teacherId, String password, String status) {
        this.id = id;
        this.studentNumber = studentNumber;
        this.name = name;
        this.grade = grade;
        this.classNum = classNum;
        this.schoolName = schoolName;
        this.teacherName = teacherName;
        this.teacherId = teacherId;
        this.password = password;
        this.status = status != null ? status : "재학";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getStudentNumber() { return studentNumber; }
    public void setStudentNumber(Integer studentNumber) { this.studentNumber = studentNumber; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
    public Integer getClassNum() { return classNum; }
    public void setClassNum(Integer classNum) { this.classNum = classNum; }
    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
