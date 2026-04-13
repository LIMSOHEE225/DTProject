package com.dtproduct.server.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "teachers")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String teacherId; // 고유 ID (로그인 시 사용)

    @Column(nullable = false)
    private String password; // 암호화된 코드

    private String phoneNumber;
    private String email;
    private Integer grade;
    private Integer classNum;
    
    @Column(nullable = false)
    private String schoolName; // 소속 학교 (외래키 역할)
    
    @Column
    private String gender;

    @Column(name = "neis_school_code")
    private String neisSchoolCode; // 나이스 학교코드 (neis_school_code로 매핑)

    public Teacher() {}

    public Teacher(Long id, String name, String teacherId, String password, String schoolName, Integer grade, Integer classNum, String gender, String neisSchoolCode) {
        this.id = id;
        this.name = name;
        this.teacherId = teacherId;
        this.password = password;
        this.schoolName = schoolName;
        this.grade = grade;
        this.classNum = classNum;
        this.gender = gender;
        this.neisSchoolCode = neisSchoolCode;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getNeisSchoolCode() { return neisSchoolCode; }
    public void setNeisSchoolCode(String neisSchoolCode) { this.neisSchoolCode = neisSchoolCode; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
    public Integer getClassNum() { return classNum; }
    public void setClassNum(Integer classNum) { this.classNum = classNum; }
    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
}
