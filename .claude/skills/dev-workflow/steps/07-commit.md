# 7단계: 커밋 & Push

## 목표

변경사항을 커밋하고, 원격 저장소에 Push합니다.

## 수행 절차

### 1. 변경사항 확인

```bash
# 변경된 파일 확인
git status

# 변경 내용 확인
git diff
```

### 2. 스테이징

```bash
# 모든 변경사항 추가
git add .

# 또는 선택적으로 추가
git add src/services/userService.ts
git add src/routes/auth.ts
```

### 3. 커밋

[커밋 메시지 템플릿](../templates/commit-message.md) 참조

```bash
git commit -m "feat: 사용자 로그인 기능 추가

- UserService에 login 메서드 추가
- /api/auth/login 엔드포인트 생성
- JWT 토큰 발급 구현

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

### 4. Push

```bash
# feature 브랜치를 원격에 push
git push -u origin feature/[브랜치명]
```

**예시:**
```bash
git push -u origin feature/user-login
```

### 5. 완료 보고

사용자에게 다음 정보를 제공합니다:

```markdown
## 완료 보고

### 구현된 기능
- 사용자 로그인 API 구현
- JWT 토큰 기반 인증

### 변경된 파일
- `src/services/userService.ts` - login 메서드 추가
- `src/routes/auth.ts` - 로그인 엔드포인트
- `src/types/auth.ts` - 타입 정의

### 테스트 결과
- 기존 테스트: 통과 (15/15)
- 수동 테스트: 정상 동작 확인

### Git 상태
- 브랜치: `feature/user-login`
- 커밋: `abc1234`
- Push: 완료

### 다음 단계
→ [8단계: PR 생성](./08-pull-request.md)으로 진행
```

## 커밋하지 않을 것

- `.env` 파일 (시크릿)
- `node_modules/` 등 의존성
- 빌드 결과물
- 개인 설정 파일

## 체크리스트

- [ ] 모든 변경사항이 스테이징 되었는가?
- [ ] 커밋 메시지가 명확한가?
- [ ] 민감한 정보가 포함되지 않았는가?
- [ ] Co-Authored-By가 포함되었는가?
- [ ] Push가 성공했는가?
- [ ] 완료 보고를 작성했는가?

## 다음 단계

Push 완료 후 → [8단계: PR 생성](./08-pull-request.md)으로 진행

## 주의사항

- **force push 금지** - 히스토리 변경 금지
- **master/main 직접 push 금지** - 항상 feature 브랜치 사용
