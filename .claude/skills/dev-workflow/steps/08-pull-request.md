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

## 4. PR 생성 후 자동 리뷰 실행 (필수)

PR 생성 후 **반드시** 백그라운드에서 PR Reviewer를 실행합니다.

```
Task tool 사용:
- subagent_type: "general-purpose"
- run_in_background: true
- prompt: "PR #{PR번호} 리뷰를 수행해주세요. 리뷰 기준: 코드 품질, 문서화, 버그 가능성, 보안. gh pr diff로 변경사항 확인 후 gh pr comment로 리뷰 결과를 남겨주세요. 표준 리뷰 형식(## Review: Approved 또는 ## Review: Changes Requested)을 사용하세요."
```

### 자동 리뷰 실행 예시

PR을 생성하고 URL을 받은 후:

```javascript
// Task tool 호출
{
  "subagent_type": "general-purpose",
  "run_in_background": true,
  "description": "PR 자동 리뷰",
  "prompt": `
    PR #${prNumber} 리뷰를 수행해주세요.

    1. gh pr diff ${prNumber}로 변경사항 확인
    2. 리뷰 기준에 따라 검토:
       - 코드 품질 (명확성, 복잡성, 중복)
       - 문서화 (주석, docstring)
       - 버그 가능성 (엣지 케이스, 에러 처리)
       - 보안 (XSS, 인젝션 등)
    3. gh pr comment ${prNumber}로 리뷰 결과 작성

    리뷰 형식:
    - 승인: ## Review: Approved
    - 변경요청: ## Review: Changes Requested
  `
}
```

## 체크리스트

- [ ] PR 제목이 규칙에 맞는가?
- [ ] Summary가 명확한가?
- [ ] 변경된 파일 목록이 정확한가?
- [ ] Test Plan이 작성되었는가?
- [ ] PR URL을 사용자에게 전달했는가?
- [ ] **자동 리뷰가 백그라운드에서 실행되었는가?**

## 주의사항

- **merge 금지** - PR 생성까지만, merge는 항상 사람이 직접
- **base 브랜치 확인** - 기본적으로 master/main으로 PR 생성
- **PR 생성 실패 시** - 에러 메시지 확인 후 사용자에게 보고
- **자동 리뷰 필수** - PR 생성 후 반드시 백그라운드 리뷰 실행
