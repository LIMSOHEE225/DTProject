---
description: 선생님이 페이지를 넘기면 모든 학생의 화면이 동시에 제어되는 동기화 로직 구현 가이드
---

# 📖 수업 화면 실시간 동기화 (Teacher-Student Sync)

## 1. 개요
선생님이 교과서의 특정 페이지(예: 125p)로 이동하거나 특정 필기를 활성화하면, 접속 중인 모든 학생의 태블릿 화면이 지연 없이 동일한 상태로 전환되어야 합니다.

## 2. 구현 단계
1. **WebSocket 주제(Topic) 정의**: 
   - `/topic/class/{classId}/sync` 경로를 통해 페이지 이동 이벤트를 발행합니다.
2. **교사 모드 브로드캐스팅**: 
   - 선생님이 `onPageChange` 시 `STOMP.publish`를 호출하여 현재 페이지 번호를 전송합니다.
3. **학생 모드 이벤트 리스너**: 
   - 학생 화면의 `useEffect`에서 해당 토픽을 구독(Subscribe)하고, 이벤트 수신 시 `navigate()` 또는 `setPage()`를 통해 화면을 강제 갱신합니다.
4. **예외 처리**: 
   - 학생이 수동으로 페이지를 넘기려 할 경우 '교사 제어 중' 메시지를 띄우고 차단합니다.

## 3. 핵심 코드 패턴 (React)
```javascript
// 학생용 페이지 동기화 리스너
useSubscription(`/topic/class/${classId}/sync`, (message) => {
  const { type, pageNumber } = JSON.parse(message.body);
  if (type === 'PAGE_MOVE' && isTeacherLocked) {
     setCurrentPage(pageNumber);
  }
});
```
