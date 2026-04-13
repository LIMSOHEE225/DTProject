package com.dtproduct.server.controller;

import com.dtproduct.server.domain.StudentReport;
import com.dtproduct.server.repository.StudentReportRepository;
import com.dtproduct.server.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin(origins = "*")
public class StudentReportController {

    private final StudentReportRepository reportRepository;
    private final GeminiService geminiService;

    public StudentReportController(StudentReportRepository reportRepository, GeminiService geminiService) {
        this.reportRepository = reportRepository;
        this.geminiService = geminiService;
    }

    // AI 월간 분석 리포트 생성
    @GetMapping("/monthly/{studentNumber}")
    public ResponseEntity<String> getMonthlyReport(@PathVariable Integer studentNumber) {
        List<StudentReport> reports = reportRepository.findByStudentNumberOrderByCreatedAtDesc(studentNumber);
        
        if (reports.isEmpty()) {
            return ResponseEntity.ok("{\"summary\":\"아직 분석할 학습 데이터가 부족합니다.\", \"weakness\":\"정보 없음\", \"advice\":\"더 많은 문제를 풀어보세요!\"}");
        }

        // 최근 10개의 데이터만 요약하여 AI에게 전달 (토큰 절약 및 핵심 분석)
        String performanceData = reports.stream()
                .limit(10)
                .map(r -> String.format("[%s] 점수: %d, 결과: %s", r.getSubject(), r.getScore(), r.getSolvedQuestions()))
                .collect(Collectors.joining("\n"));

        String studentName = reports.get(0).getStudentName();
        String analysisResult = geminiService.analyzeStudentPerformance(studentName, performanceData);
        
        return ResponseEntity.ok(analysisResult);
    }

    // 학생별 전체 리포트 조회 (최신순)
    @GetMapping("/student/{studentNumber}")
    public ResponseEntity<List<StudentReport>> getReportsByStudent(@PathVariable Integer studentNumber) {
        return ResponseEntity.ok(reportRepository.findByStudentNumberOrderByCreatedAtDesc(studentNumber));
    }

    // 새로운 리포트 저장
    @PostMapping
    public ResponseEntity<StudentReport> saveReport(@RequestBody StudentReport report) {
        if (report.getCreatedAt() == null) {
            report.setCreatedAt(LocalDateTime.now());
        }
        return ResponseEntity.ok(reportRepository.save(report));
    }
}
