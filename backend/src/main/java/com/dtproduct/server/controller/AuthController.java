package com.dtproduct.server.controller;

import com.dtproduct.server.domain.User;
import com.dtproduct.server.domain.UserRole;
import com.dtproduct.server.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/user/{loginId}")
    public ResponseEntity<?> getUserInfo(@PathVariable String loginId) {
        return userRepository.findByLoginId(loginId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/user/{loginId}")
    public ResponseEntity<?> updateUser(@PathVariable String loginId, @RequestBody Map<String, String> payload) {
        return userRepository.findByLoginId(loginId).map(user -> {
            // 기존 비밀번호 검증
            String currentPassword = payload.get("currentPassword");
            if (currentPassword == null || currentPassword.isEmpty() || !passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.status(401).body(Map.of("message", "기존 비밀번호가 일치하지 않습니다."));
            }

            if (payload.get("grade") != null && !payload.get("grade").isEmpty()) user.setGrade(Integer.parseInt(payload.get("grade")));
            if (payload.get("classNum") != null && !payload.get("classNum").isEmpty()) user.setClassNum(Integer.parseInt(payload.get("classNum")));
            if (payload.get("email") != null) user.setEmail(payload.get("email"));
            if (payload.get("name") != null) user.setName(payload.get("name"));
            if (payload.get("phoneNumber") != null) user.setPhoneNumber(payload.get("phoneNumber"));

            String newPassword = payload.get("password");
            if (newPassword != null && !newPassword.isEmpty()) {
                user.setPassword(passwordEncoder.encode(newPassword));
            }
            
            User saved = userRepository.save(user);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }


    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        // ID 중복 체크
        if (userRepository.findByLoginId(user.getLoginId()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "이미 등록된 기관 또는 계정입니다."));
        }

        // 비밀번호 암호화 및 로그 추가 (디버깅용)
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            String rawPassword = user.getPassword();
            String encodedPassword = passwordEncoder.encode(rawPassword);
            user.setPassword(encodedPassword);
            System.out.println("[SIGNUP DEBUG] Password encrypted - Raw: " + rawPassword + " -> Encoded: " + encodedPassword);
        } else {
            System.out.println("[SIGNUP DEBUG] Warning: Password is null or empty!");
        }

        // 교사 고유 코드 처리
        if (user.getTeacherCode() != null) {
            user.setTeacherCode(user.getTeacherCode());
        }
        
        User savedUser = userRepository.save(user);
        System.out.println("[SIGNUP DEBUG] User saved to 'users' table successfully.");
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String loginId = credentials.get("loginId");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByLoginId(loginId);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // DB에 저장된 암호화된 비밀번호와 입력한 비밀번호 비교
            if (passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.ok(user);
            } else if (user.getTeacherCode() != null && password.equals(user.getTeacherCode())) {
                // 교사의 경우 고유 코드로도 진입 가능하게 할 경우 (운영 정책에 따라 조정)
                return ResponseEntity.ok(user);
            }
        }

        return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 일치하지 않습니다."));
    }
}
