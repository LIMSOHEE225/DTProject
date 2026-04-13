# 데이터베이스 및 API 상세 설계서 (Low-Level Design)

본 문서는 **'DTProject'** 개발을 위한 핵심 데이터베이스 테이블 구조와 API 엔드포인트를 정의합니다. 

## 1. 데이터베이스 ERD 설계 (MySQL)

```mermaid
erDiagram
    SCHOOL ||--o{ USER : contains
    USER ||--o{ CLASS_SESSION : manages
    USER ||--o{ STUDENT_REPORT : receives
    BOOK ||--o{ CLASS_SESSION : used_in
    BOOK ||--o{ STUDENT_REPORT : generated_for

    SCHOOL {
        bigint id PK
        varchar name
        varchar school_code "회원가입 시 검증 코드"
    }

    USER {
        bigint id PK
        varchar login_id
        varchar password
        varchar name
        enum role "TEACHER / STUDENT"
        int grade "학년"
        int class_num "반"
        bigint school_id FK
    }

    BOOK {
        bigint id PK
        varchar title
        varchar content_url "S3/Firebase 이미지 경로"
        int grade "해당 학년"
        varchar subject "과목"
    }

    CLASS_SESSION {
        bigint id PK
        bigint teacher_id FK
        bigint book_id FK
        int current_page "현재 교사 페이지"
        boolean is_sync_on "동기화 활성화 여부"
        boolean is_drawing_on "판서 모드 활성화 여부"
        datetime start_at
    }

    STUDENT_REPORT {
        bigint id PK
        bigint student_id FK
        bigint book_id FK
        json solved_data "문제 풀이 기록 및 오답 상세"
        text ai_feedback "AI 생성 맞춤 피드백"
        varchar progress "학습 진행도 (%)"
        datetime analysis_date
    }
```

## 2. API 엔드포인트 설계 (RESTful)

| 분류 | HTTP Method | Endpoint | 설명 |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/v1/auth/signup` | 학교 코드 기반 회원가입 |
| **Auth** | POST | `/api/v1/auth/login` | 로그인 및 JWT 토큰 발급 |
| **Class** | GET | `/api/v1/classes` | 사용자가 속한 학급 및 수업 목록 조회 |
| **Session** | POST | `/api/v1/sessions/start` | (교사) 수업 세션 생성 및 시작 |
| **Session** | PATCH | `/api/v1/sessions/{id}/sync` | (교사) 동기화 모드 On/Off 전환 |
| **Report** | GET | `/api/v1/reports/student/{id}` | 특정 학생의 AI 학습 리포트 조회 |
| **Report** | POST | `/api/v1/reports/analyze` | AI 분석 엔진 호출 및 리포트 저장 |

## 3. 실시간 통신 스키마 (WebSocket/STOMP)

-   **Endpoint:** `ws://{host}/ws-stomp`
-   **Broker Topics:**
    -   `/topic/class/{sessionId}/page`: 페이지 이동 정보 전송 (`{"type": "PAGE_MOVE", "page": 12}`)
    -   `/topic/class/{sessionId}/drawing`: 실시간 판서 데이터 전송 (`{"type": "DRAW", "data": "coordinates..."}`)
    -   `/topic/class/{sessionId}/monitor`: 학생 상태 모니터링 (`{"type": "STUDENT_STATUS", "studentId": 1, "status": "STUCK"}`)

---
> [!TIP]
> `STUDENT_REPORT` 테이블의 `solved_data`는 JSON 타입을 사용하여 문제별 체류 시간, 오답 빈도 등 비정형 데이터를 유연하게 저장합니다.
