package com.dtproduct.server.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String loginId;

    @Column(nullable = false)
    private String password;

    private String name;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String schoolName;
    private String neisSchoolCode;
    private String representativeName;
    private String schoolAddress;
    private String phoneNumber;
    private String email;
    private Integer grade;
    private Integer classNum;
    private String teacherCode; // 교사 고유 식별 코드 (8자리, 암호화 저장)

    public User() {}

    public User(Long id, String loginId, String password, String name, UserRole role, String schoolName, 
                String neisSchoolCode, String representativeName, String schoolAddress, String phoneNumber, String email,
                Integer grade, Integer classNum) {
        this.id = id;
        this.loginId = loginId;
        this.password = password;
        this.name = name;
        this.role = role;
        this.schoolName = schoolName;
        this.neisSchoolCode = neisSchoolCode;
        this.representativeName = representativeName;
        this.schoolAddress = schoolAddress;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.grade = grade;
        this.classNum = classNum;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }
    public String getNeisSchoolCode() { return neisSchoolCode; }
    public void setNeisSchoolCode(String neisSchoolCode) { this.neisSchoolCode = neisSchoolCode; }
    public String getRepresentativeName() { return representativeName; }
    public void setRepresentativeName(String representativeName) { this.representativeName = representativeName; }
    public String getSchoolAddress() { return schoolAddress; }
    public void setSchoolAddress(String schoolAddress) { this.schoolAddress = schoolAddress; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Integer getGrade() { return grade; }
    public void setGrade(Integer grade) { this.grade = grade; }
    public Integer getClassNum() { return classNum; }
    public void setClassNum(Integer classNum) { this.classNum = classNum; }
    public String getTeacherCode() { return teacherCode; }
    public void setTeacherCode(String teacherCode) { this.teacherCode = teacherCode; }

    // Builder
    public static class UserBuilder {
        private Long id;
        private String loginId;
        private String password;
        private String name;
        private UserRole role;
        private String schoolName;
        private String neisSchoolCode;
        private String representativeName;
        private String schoolAddress;
        private String phoneNumber;
        private String email;
        private Integer grade;
        private Integer classNum;
        private String teacherCode;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder loginId(String loginId) { this.loginId = loginId; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder role(UserRole role) { this.role = role; return this; }
        public UserBuilder schoolName(String schoolName) { this.schoolName = schoolName; return this; }
        public UserBuilder neisSchoolCode(String neisSchoolCode) { this.neisSchoolCode = neisSchoolCode; return this; }
        public UserBuilder representativeName(String representativeName) { this.representativeName = representativeName; return this; }
        public UserBuilder schoolAddress(String schoolAddress) { this.schoolAddress = schoolAddress; return this; }
        public UserBuilder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder grade(Integer grade) { this.grade = grade; return this; }
        public UserBuilder classNum(Integer classNum) { this.classNum = classNum; return this; }
        public UserBuilder teacherCode(String teacherCode) { this.teacherCode = teacherCode; return this; }
        public User build() {
            User user = new User(id, loginId, password, name, role, schoolName, neisSchoolCode, representativeName, schoolAddress, phoneNumber, email, grade, classNum);
            user.setTeacherCode(teacherCode);
            return user;
        }
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }
}
