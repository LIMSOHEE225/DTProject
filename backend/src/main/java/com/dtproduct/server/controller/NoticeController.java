package com.dtproduct.server.controller;

import com.dtproduct.server.entity.Notice;
import com.dtproduct.server.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NoticeController {

    private final NoticeRepository noticeRepository;

    // 전체 조회 (최신순)
    @GetMapping
    public List<Notice> getAll() {
        return noticeRepository.findAllByOrderByCreatedAtDesc();
    }

    // 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<Notice> getById(@PathVariable Long id) {
        return noticeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 생성
    @PostMapping
    public ResponseEntity<Notice> create(@RequestBody Notice notice) {
        return ResponseEntity.ok(noticeRepository.save(notice));
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<Notice> update(@PathVariable Long id, @RequestBody Notice body) {
        return noticeRepository.findById(id).map(notice -> {
            notice.setTitle(body.getTitle());
            notice.setContent(body.getContent());
            return ResponseEntity.ok(noticeRepository.save(notice));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        if (!noticeRepository.existsById(id)) return ResponseEntity.notFound().build();
        noticeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "삭제 완료"));
    }
}
