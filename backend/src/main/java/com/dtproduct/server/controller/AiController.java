package com.dtproduct.server.controller;

import com.dtproduct.server.service.GeminiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @GetMapping("/generate-problems")
    public String generateProblems(
            @RequestParam int grade,
            @RequestParam String chapter,
            @RequestParam String level,
            @RequestParam int count) {
        
        System.out.println("AI 문제 생성 요청 접수: 학년=" + grade + ", 단원=" + chapter + ", 난이도=" + level);
        return geminiService.generateProblems(grade, chapter, level, count);
    }
}
