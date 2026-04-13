package com.dtproduct.server.controller;

import com.dtproduct.server.domain.Student;
import com.dtproduct.server.repository.StudentRepository;
import com.dtproduct.server.repository.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentController(StudentRepository studentRepository, 
                             TeacherRepository teacherRepository,
                             PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Student student) {
        if (studentRepository.findByStudentNumberAndSchoolNameAndGradeAndClassNum(
                student.getStudentNumber(), student.getSchoolName(), student.getGrade(), student.getClassNum()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "해당 반에 이미 등록된 번호입니다."));
        }
        
        // --- 추가: 비밀번호 암호화 저장 ---
        if (student.getPassword() != null && !student.getPassword().isEmpty()) {
            student.setPassword(passwordEncoder.encode(student.getPassword()));
        } else {
            // 비밀번호가 없는 경우 기본값으로 번호를 사용하여 저장
            student.setPassword(passwordEncoder.encode(String.valueOf(student.getStudentNumber())));
        }
        
        return ResponseEntity.ok(studentRepository.save(student));
    }

    @GetMapping("/filter")
    public List<Student> getStudents(
            @RequestParam String schoolName,
            @RequestParam Integer grade,
            @RequestParam Integer classNum) {
        return studentRepository.findBySchoolNameAndGradeAndClassNum(schoolName, grade, classNum);
    }

    @GetMapping("/teacher/{teacherName}")
    public List<Student> getStudentsByTeacherName(@PathVariable String teacherName) {
        return studentRepository.findByTeacherName(teacherName);
    }

    @PostMapping("/update/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable String id, @RequestBody Map<String, Object> updateRequest) {
        System.out.println("POST /api/v1/students/update/" + id + " reached.");
        Long studentIdLong = Long.parseLong(id);
        String teacherPassword = (String) updateRequest.get("teacherPassword");
        String teacherName = (String) updateRequest.get("teacherName");
        
        var teacherOpt = teacherRepository.findByName(teacherName);
        System.out.println("Teacher lookup for name [" + teacherName + "]: " + (teacherOpt.isPresent() ? "Found" : "Not Found"));
        
        if (teacherOpt.isEmpty() || !passwordEncoder.matches(teacherPassword, teacherOpt.get().getPassword())) {
            if (teacherOpt.isPresent()) {
                System.out.println("Password mismatch for teacher: " + teacherName);
            }
            return ResponseEntity.status(401).body(Map.of("message", "선생님 비밀번호가 일치하지 않습니다."));
        }

        return studentRepository.findById(studentIdLong).map(student -> {
            student.setName((String) updateRequest.get("name"));
            
            if (updateRequest.containsKey("studentNumber")) {
                Integer newNumber = Integer.parseInt(updateRequest.get("studentNumber").toString());
                if (!student.getStudentNumber().equals(newNumber)) {
                    if (studentRepository.findByStudentNumberAndSchoolNameAndGradeAndClassNum(
                            newNumber, student.getSchoolName(), student.getGrade(), student.getClassNum()).isPresent()) {
                        return ResponseEntity.badRequest().body(Map.of("message", "이미 존재하는 번호입니다."));
                    }
                    student.setStudentNumber(newNumber);
                }
            }

            if (updateRequest.containsKey("status")) {
                student.setStatus((String) updateRequest.get("status"));
            }

            // --- 추가: 학생 비밀번호 수정 시 암호화 ---
            if (updateRequest.containsKey("password") && updateRequest.get("password") != null && !((String)updateRequest.get("password")).isEmpty()) {
                student.setPassword(passwordEncoder.encode((String) updateRequest.get("password")));
            }

            studentRepository.save(student);
            return ResponseEntity.ok(Map.of("message", "성공적으로 수정되었습니다."));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> request) {
        String inputPassword = (String) request.get("password");

        if (inputPassword == null || inputPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "비밀번호를 입력해 주세요."));
        }

        // 전체 학생 중 비밀번호가 일치하는 학생 찾기
        List<Student> allStudents = studentRepository.findAll();
        for (Student student : allStudents) {
            if (student.getPassword() != null && passwordEncoder.matches(inputPassword, student.getPassword())) {
                java.util.Map<String, Object> responseData = new java.util.HashMap<>();
                responseData.put("status", "success");
                responseData.put("id", student.getId());
                responseData.put("name", student.getName());
                responseData.put("studentNumber", student.getStudentNumber());
                responseData.put("schoolName", student.getSchoolName());
                responseData.put("grade", student.getGrade());
                responseData.put("classNum", student.getClassNum());
                responseData.put("teacherName", student.getTeacherName() != null ? student.getTeacherName() : "");
                responseData.put("teacherId", student.getTeacherId() != null ? student.getTeacherId() : 0L);
                responseData.put("role", "STUDENT");
                
                return ResponseEntity.ok(responseData);
            }
        }

        java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
        errorResponse.put("message", "비밀번호가 일치하는 학생을 찾을 수 없습니다.");
        return ResponseEntity.status(401).body(errorResponse);
    }
    @GetMapping("/fix-ids")
    public String fixIds() {
        var teachers = teacherRepository.findAll();
        for (var teacher : teachers) {
            var students = studentRepository.findByTeacherName(teacher.getName());
            for (var student : students) {
                student.setTeacherId(teacher.getId());
                studentRepository.save(student);
            }
        }
        return "Migration Success! [Teacher matched with Students]";
    }
}
