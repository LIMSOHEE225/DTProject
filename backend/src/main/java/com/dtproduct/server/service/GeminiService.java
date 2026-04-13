package com.dtproduct.server.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Service
public class GeminiService {

    private final String API_KEY = "AIzaSyAhnXIU3uOwN9n4okzdU-bZVTonWL5Xojs";
    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 학생의 누적 데이터를 바탕으로 AI 월간 분석 리포트 생성
     */
    public String analyzeStudentPerformance(String studentName, String performanceData) {
        String prompt = String.format(
            "당신은 교육 전문가 AI입니다. 다음 학생(%s)의 최근 학습 데이터를 보고 학부모와 교사에게 전달할 '월간 분석 리포트'를 작성해 주세요.\n\n" +
            "데이터:\n%s\n\n" +
            "요구사항:\n" +
            "1. 전체적인 학습 성취도 요약 (2~3문장)\n" +
            "2. 가장 취약한 개념 또는 단원 도출\n" +
            "3. 향후 학습을 위한 조언 및 격려\n" +
            "4. 반드시 한국어로 작성하고, 따뜻하고 격려하는 말투를 사용하세요.\n" +
            "5. 결과는 JSON 구조로 반환하되, 반드시 'summary', 'weakness', 'advice' 필드를 포함하세요.",
            studentName, performanceData
        );

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            return "{\"summary\":\"데이터 분석 중 오류가 발생했습니다.\", \"weakness\":\"정보 없음\", \"advice\":\"시스템 점검 중입니다.\"}";
        }
    }

    public String generateProblems(int grade, String chapter, String level, int count) {
        String prompt = String.format(
            "초등학교 %d학년 '%s' 단원 %s 난이도 수학 문제 %d개를 반드시 JSON 배열([])로만 만들어.",
            grade, chapter, level, count
        );

        try {
            return callGemini(prompt);
        } catch (Exception e) {
            System.err.println("AI 엔진 차단됨. 백로그 엔진 가동.");
            return generateBackupProblems(grade, chapter, level, count);
        }
    }

    private String callGemini(String prompt) throws Exception {
        String url = GEMINI_API_URL + API_KEY;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> contentMap = new HashMap<>();
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> partMap = new HashMap<>();
        partMap.put("text", prompt);
        parts.add(partMap);
        contentMap.put("parts", parts);
        contents.add(contentMap);
        requestBody.put("contents", contents);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String response = restTemplate.postForObject(url, entity, String.class);
        JsonNode root = objectMapper.readTree(response);
        String rawJson = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        return rawJson.replaceAll("```json", "").replaceAll("```", "").trim();
    }

    private String generateBackupProblems(int grade, String chapter, String level, int count) {
        List<Map<String, Object>> problems = new ArrayList<>();
        Random rand = new Random();
        
        int min = 1, max = 10;
        if ("normal".equals(level)) { min = 10; max = 30; }
        else if ("hard".equals(level)) { min = 30; max = 60; }

        for (int i = 0; i < count; i++) {
            Map<String, Object> p = new HashMap<>();
            int r1 = rand.nextInt(max - min + 1) + min;
            int r2 = rand.nextInt(max - min + 1) + min;
            
            if (grade <= 3) {
                p.put("question", String.format("동물원에 사자가 %d마리, 호랑이가 %d마리 있습니다. 모두 몇 마리일까요?", r1, r2));
                p.put("answer", (r1 + r2) + "마리");
                p.put("explanation", String.format("%d + %d = %d 입니다.", r1, r2, (r1+r2)));
                p.put("options", Arrays.asList((r1+r2)+"마리", (r1+r2+1)+"마리", (r1+r2-1)+"마리", (r1+r2+2)+"마리"));
            } else {
                p.put("question", String.format("어느 공장에 사탕 %d상자가 있습니다. 한 상자에 사탕이 %d개씩 들어있다면 전체 사탕의 개수는?", r1, r2));
                p.put("answer", (long)r1 * r2 + "개");
                p.put("explanation", String.format("%d x %d = %d 입니다.", r1, r2, (long)r1*r2));
                p.put("options", Arrays.asList((long)r1*r2+"개", (long)r1*r2+10+"개", (long)r1*r2-5+"개", (long)r1*r2+20+"개"));
            }
            problems.add(p);
        }

        try {
            return objectMapper.writeValueAsString(problems);
        } catch (Exception e) {
            return "[]";
        }
    }
}
