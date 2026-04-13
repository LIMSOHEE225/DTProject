---
description: 수업 중 학생이 다른 사이트로 이동하는 것을 막는 집중 모드(Lock) 구현 가이드
---

# 🔒 수업 집중 모드 (Student Focus Lock)

## 1. 개요
인터넷 서핑이나 게임 등 수업 외 활동을 차단하여 학습 몰입도를 높이는 기능입니다. 브라우저의 샌드박스 특성을 활용하여 'Full-Screen' 강제 및 'Navigation Guard'를 적용합니다.

## 2. 주요 기능
1. **Full-Screen API 연동**:
   - 선생님이 '수업 시작' 클릭 시 학생 탭이 자동으로 전체 화면으로 전환됩니다. (사용자 상호작용 필요 시 '확인' 팝업 후 고정)
2. **Navigation Guard (React Router)**:
   - `useEffect`와 `history.block`을 사용하여 교과서 페이지 이외의 다른 URL로 이동하려고 할 때 "수업 중에는 이동할 수 없습니다" 팝업을 띄우고 차단합니다.
3. **Focus Loss 감지**:
   - 학생이 브라우저 창을 최소화하거나 다른 탭을 클릭할 경우(`visibilitychange` 이벤트), 즉시 선생님 대시보드에 'A 학생 이탈' 경고 알림을 보냅니다.

## 3. 필기 권한 유지
- 화면이 잠긴 상태에서도 하단의 **'노트/필기 레이어'**는 항상 활성화되어야 하며, `z-index` 설정을 통해 교과서 위에 자유로운 필기가 가능하도록 설계합니다.

## 4. 핵심 코드 (JavaScript)
```javascript
document.addEventListener("visibilitychange", () => {
  if (document.hidden && isClassRunning) {
    // 백엔드로 이탈 신호 전송
    sendAlertToTeacher("Student Away from Screen");
  }
});
```
