# Pull Request 템플릿

## 형식

```markdown
## Summary

[1-3 bullet points summarizing the changes]

## Changes

[Detailed list of what was changed]

## Test Plan

[How to test these changes]

---
Generated with Claude Code
```

## 예시

### 기능 추가 PR

```markdown
## Summary

- 사용자 로그인/로그아웃 기능 구현
- JWT 기반 인증 시스템 추가
- 로그인 API 엔드포인트 생성

## Changes

### 새로운 파일
- `src/services/authService.ts` - 인증 서비스
- `src/routes/auth.ts` - 인증 라우트
- `src/middleware/auth.ts` - 인증 미들웨어

### 수정된 파일
- `src/types/index.ts` - User 타입 추가
- `src/app.ts` - 라우트 등록

## Test Plan

- [ ] `POST /api/auth/login` - 유효한 자격증명으로 로그인
- [ ] `POST /api/auth/login` - 잘못된 비밀번호로 401 응답
- [ ] `GET /api/users/me` - 토큰 없이 401 응답
- [ ] `GET /api/users/me` - 유효한 토큰으로 사용자 정보 반환

---
Generated with Claude Code
```

### 버그 수정 PR

```markdown
## Summary

- 결제 실패 시 에러 메시지가 표시되지 않던 버그 수정

## Changes

- `src/components/Payment.tsx` - catch 블록에서 에러 상태 업데이트
- `src/components/ErrorMessage.tsx` - 에러 메시지 스타일 추가

## Test Plan

- [ ] 유효하지 않은 카드로 결제 시도 시 에러 메시지 표시 확인
- [ ] 네트워크 오류 시 적절한 메시지 표시 확인
- [ ] 정상 결제 시 성공 메시지 표시 확인

---
Generated with Claude Code
```

## gh 명령어로 PR 생성

```bash
gh pr create --title "feat: 사용자 로그인 기능" --body "$(cat <<'EOF'
## Summary

- 사용자 로그인 기능 구현
- JWT 기반 인증

## Test Plan

- [ ] 로그인 테스트
- [ ] 인증 실패 테스트

---
Generated with Claude Code
EOF
)"
```

## 주의사항

- PR은 사람이 직접 생성
- 요청 시에만 gh 명령어로 생성 도움
- merge는 항상 사람이 진행
