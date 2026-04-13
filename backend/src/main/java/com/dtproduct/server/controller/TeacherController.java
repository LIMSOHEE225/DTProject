package com.dtproduct.server.controller;

import com.dtproduct.server.domain.Teacher;
import com.dtproduct.server.repository.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/teachers")
public class TeacherController {

    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherController(TeacherRepository teacherRepository, PasswordEncoder passwordEncoder) {
        this.teacherRepository = teacherRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<?> createTeacher(@RequestBody Teacher teacher) {
        if (teacherRepository.findByTeacherId(teacher.getTeacherId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "이미 등록된 교사 ID입니다."));
        }
        
        // 사용자가 입력한 비밀번호가 있으면 그것을 암호화, 없으면 아이디를 초기 비밀번호로 설정
        String rawPassword = (teacher.getPassword() != null && !teacher.getPassword().isEmpty()) 
                             ? teacher.getPassword() 
                             : teacher.getTeacherId();
                             
        teacher.setPassword(passwordEncoder.encode(rawPassword));
        Teacher saved = teacherRepository.save(teacher);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/school/{schoolName}")
    public List<Teacher> getTeachersBySchool(@PathVariable String schoolName) {
        return teacherRepository.findBySchoolName(schoolName);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacherDetails) {
        Optional<Teacher> teacherOpt = teacherRepository.findById(id);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            teacher.setName(teacherDetails.getName());
            teacher.setPhoneNumber(teacherDetails.getPhoneNumber());
            teacher.setEmail(teacherDetails.getEmail());
            teacher.setGrade(teacherDetails.getGrade());
            teacher.setClassNum(teacherDetails.getClassNum());
            teacher.setNeisSchoolCode(teacherDetails.getNeisSchoolCode());
            
            // ID 변경 시에만 비밀번호 동기화 (기존 로직 유지하되 명확히 체크)
            if (teacherDetails.getTeacherId() != null && !teacherDetails.getTeacherId().isEmpty() && !teacherDetails.getTeacherId().equals(teacher.getTeacherId())) {
                teacher.setTeacherId(teacherDetails.getTeacherId());
                teacher.setPassword(passwordEncoder.encode(teacherDetails.getTeacherId()));
            }
            
            return ResponseEntity.ok(teacherRepository.save(teacher));
        }
        return ResponseEntity.notFound().build();
    }

    // --- 마이페이지용 프로필 업데이트 (비밀번호, 이메일 전용) ---
    @PatchMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> updates) {
        return teacherRepository.findById(id).map(teacher -> {
            boolean isUpdated = false;
            
            if (updates.containsKey("email")) {
                teacher.setEmail(updates.get("email"));
                isUpdated = true;
            }
            
            if (updates.containsKey("password") && !updates.get("password").isEmpty()) {
                teacher.setPassword(passwordEncoder.encode(updates.get("password")));
                isUpdated = true;
            }
            
            if (isUpdated) {
                Teacher saved = teacherRepository.save(teacher);
                return ResponseEntity.ok(saved);
            }
            return ResponseEntity.badRequest().body(Map.of("message", "변경할 정보가 없습니다."));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        if (teacherRepository.existsById(id)) {
            teacherRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/check-id/{teacherId}")
    public ResponseEntity<?> checkTeacherId(@PathVariable String teacherId) {
        boolean exists = teacherRepository.findByTeacherId(teacherId).isPresent();
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String teacherId = credentials.get("teacherId");
        String password = credentials.get("password");
        
        return teacherRepository.findByTeacherId(teacherId)
                .map(teacher -> {
                    if (passwordEncoder.matches(password, teacher.getPassword())) {
                        return ResponseEntity.ok(teacher);
                    }
                    return ResponseEntity.status(401).body(Map.of("message", "비밀번호가 일치하지 않습니다."));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("message", "존재하지 않는 선생님 아이디입니다.")));
    }

    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String phoneNumber = payload.get("phoneNumber");

        return teacherRepository.findAll().stream()
                .filter(t -> t.getName().equals(name) && t.getPhoneNumber().equals(phoneNumber))
                .findFirst()
                .map(t -> {
                    String id = t.getTeacherId();
                    String maskedId = id.substring(0, Math.min(id.length(), 3)) + "***";
                    return ResponseEntity.ok(Map.of("teacherId", maskedId));
                })
                .orElse(ResponseEntity.status(404).body(Map.of("message", "일치하는 회원 정보가 없습니다.")));
    }

    @PostMapping("/find-password")
    public ResponseEntity<?> findPassword(@RequestBody Map<String, String> payload) {
        String teacherId = payload.get("teacherId");
        String name = payload.get("name");
        String phoneNumber = payload.get("phoneNumber");
        String email = payload.get("email");

        return teacherRepository.findByTeacherId(teacherId)
                .filter(t -> t.getName().equals(name) && t.getPhoneNumber().equals(phoneNumber) && t.getEmail().equals(email))
                .map(t -> {
                    // 임시 비밀번호 생성 (8자리 랜덤)
                    String tempPassword = "temp" + (int)(Math.random() * 9000 + 1000) + "!";
                    t.setPassword(passwordEncoder.encode(tempPassword));
                    teacherRepository.save(t);
                    
                    // 실제 서비스라면 여기서 이메일을 발송해야 함
                    return ResponseEntity.ok(Map.of(
                        "message", "본인 확인이 완료되었습니다. 입력하신 이메일로 임시 비밀번호가 발송되었습니다.",
                        "tempPassword", tempPassword 
                    ));
                })
                .orElse(ResponseEntity.status(404).body(Map.of("message", "입력하신 정보와 일치하는 회원을 찾을 수 없습니다.")));
    }
}
