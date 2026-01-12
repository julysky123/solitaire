# 8단계: PR 생성

## 목표

GitHub에 Pull Request를 생성합니다.

## 수행 절차

### 1. PR 생성

`gh` CLI를 사용하여 PR을 생성합니다.

```bash
gh pr create --title "[타입]: 제목" --body "$(cat <<'EOF'
## Summary

- 변경사항 요약 1
- 변경사항 요약 2

## Changes

### 새로운 파일
- `path/to/new/file.ts` - 설명

### 수정된 파일
- `path/to/modified/file.ts` - 설명

## Test Plan

- [ ] 테스트 항목 1
- [ ] 테스트 항목 2

---
Generated with Claude Code
EOF
)"
```

### 2. PR 제목 형식

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 | `feat: 사용자 로그인 기능 추가` |
| `fix` | 버그 수정 | `fix: 결제 오류 수정` |
| `refactor` | 리팩토링 | `refactor: 인증 로직 개선` |
| `docs` | 문서 수정 | `docs: API 문서 업데이트` |

### 3. 완료 보고

PR 생성 후 사용자에게 다음 정보를 제공합니다:

```markdown
## PR 생성 완료

### PR 정보
- URL: https://github.com/user/repo/pull/123
- 브랜치: `feature/user-login` → `master`

### 구현된 기능
- 기능 요약

### 다음 단계 (사람이 진행)
1. PR 리뷰 확인
2. 필요시 수정
3. 승인 후 merge
```

## 예시

### 기능 추가 PR

```bash
gh pr create --title "feat: 사용자 로그인 기능 추가" --body "$(cat <<'EOF'
## Summary

- JWT 기반 사용자 인증 구현
- 로그인/로그아웃 API 엔드포인트 추가

## Changes

### 새로운 파일
- `src/services/authService.ts` - 인증 서비스
- `src/routes/auth.ts` - 인증 라우트

### 수정된 파일
- `src/app.ts` - 라우트 등록

## Test Plan

- [ ] 유효한 자격증명으로 로그인 성공
- [ ] 잘못된 비밀번호로 401 응답
- [ ] 토큰 없이 보호된 엔드포인트 접근 시 401

---
Generated with Claude Code
EOF
)"
```

### 버그 수정 PR

```bash
gh pr create --title "fix: 결제 실패 시 에러 메시지 미표시" --body "$(cat <<'EOF'
## Summary

- 결제 실패 시 에러 메시지가 표시되지 않던 버그 수정

## Changes

- `src/components/Payment.tsx` - 에러 상태 처리 추가

## Test Plan

- [ ] 잘못된 카드로 결제 시도 시 에러 메시지 표시 확인

---
Generated with Claude Code
EOF
)"
```

## 체크리스트

- [ ] PR 제목이 규칙에 맞는가?
- [ ] Summary가 명확한가?
- [ ] 변경된 파일 목록이 정확한가?
- [ ] Test Plan이 작성되었는가?
- [ ] PR URL을 사용자에게 전달했는가?

## 주의사항

- **merge 금지** - PR 생성까지만, merge는 항상 사람이 직접
- **base 브랜치 확인** - 기본적으로 master/main으로 PR 생성
- **PR 생성 실패 시** - 에러 메시지 확인 후 사용자에게 보고
