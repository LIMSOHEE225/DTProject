# 비기능적 요구사항 및 인프라 설계서 (NFR & Infra)

본 문서는 **'DTProject'**의 보안, 성능, 배포 환경 및 인프라 구성을 정의합니다. 

## 1. 보안 및 인증 (Security)

-   **인증 (Authentication):** 
    -   JWT (JSON Web Token) 및 Spring Security 기반의 무상태(Stateless) 인증 체계 구축.
    -   로그인 세션 관리 및 토큰 만료 정책 적용.
-   **권한 (Authorization):** 
    -   RBAC (Role-Based Access Control) 적용: `ROLE_TEACHER`, `ROLE_STUDENT`.
    -   교사는 담당 학급 학생들의 데이터에만 접근 가능하도록 데이터 수준의 필터링 수행.
-   **데이터 보호:** 
    -   데이터베이스 내 비밀번호는 BCrypt 해시 알고리즘으로 암호화 저장.
    -   민감 정보(개인정보 등) 전송 시 HTTPS(TLS) 프로토콜 필수 적용.

## 2. 성능 및 확장성 (Performance & Scalability)

-   **실시간 동기화 효율화:** 
    -   STOMP 브로커를 통한 메시지 패키징 및 라우팅 최적화.
    -   판서(Drawing) 데이터 전송 시 지나치게 빈번한 좌표 전송을 방지하기 위한 쓰로틀링(Throttling) 기법 적용.
-   **데이터베이스 가속:** 
    -   `USER.school_id`, `STUDENT_REPORT.student_id` 등 조회 빈도가 높은 외래 키(FK) 컬럼에 인덱스(Index) 생성.
    -   대형 이미지/PDF 리소스는 CDN(Content Delivery Network) 또는 최적화된 스토리지 연동.
-   **동시 접속 대응:** 
    -   초기 1학급(30명) 대상이지만, 향후 학년 단위 확장을 고려하여 무상태(Stateless) API 서버 구성으로 수평적 확장(Scale-out)이 가능하도록 설계.

## 3. 인프라 및 배포 전략 (Infra & Deployment)

-   **애플리케이션 스택:** 
    -   **Backend:** Java 17+, Spring Boot 3.3.x, Gradle.
    -   **Frontend:** Node.js 20+, React 18, Vite (빌드 도구).
-   **배포 환경:** 
    -   **Server:** Ubuntu Desktop/Server 22.04 LTS.
    -   **Containerization:** Docker 및 Docker Compose를 활용하여 DB와 API 서버를 일관된 환경으로 배포.
-   **외부 서비스 활용:** 
    -   **Firebase Cloud Messaging (FCM):** 실시간 수업 알림 및 공지사항 푸시.
    -   **Cloud Storage (옵션):** 교과서 PDF 및 학생 과제 파일 저장 (S3 호환 스토리지).

## 4. 운영 및 모니터링 (Ops & Monitoring)

-   **로그 관리:** SLF4J + Logback을 통한 레벨별 로그 관리 (ERROR, WARN, INFO).
-   **헬스 체크:** Spring Boot Actuator를 연동하여 서버 상태 및 리소스 사용량 실시간 모니터링.

---
> [!NOTE]
> 1인 개발 체제와 13일 출시 일정을 고려하여, 초기 배포는 안정적인 단일 서버 환경에서 Docker를 이용해 신속하게 진행하는 것을 권장합니다.
