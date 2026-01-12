---
name: pr-reviewer
description: GitHub PR을 자동으로 리뷰하는 skill입니다. PR의 코드 변경사항을 분석하고, 승인 또는 변경 요청을 합니다.
allowed-tools: Bash, Read, Glob, Grep, Task
user-invocable: true
---

# PR Reviewer Skill

## 개요

GitHub PR을 리뷰하고 승인/변경요청을 하는 skill입니다.

## 리뷰 기준

### 1. 코드 품질
- 코드가 명확하고 읽기 쉬운가?
- 불필요한 복잡성이 없는가?
- 중복 코드가 없는가?

### 2. 문서화
- docstring이 있는가?
- 타입 힌트가 있는가?
- 복잡한 로직에 주석이 있는가?

### 3. 버그/에러 가능성
- 명백한 버그가 있는가?
- 엣지 케이스를 처리하는가?
- 에러 처리가 적절한가?

### 4. 보안
- 보안 취약점이 있는가? (SQL injection, XSS 등)
- 민감 정보가 노출되는가?

## 수행 절차

### 1. PR 정보 확인

```bash
# 열린 PR 목록 확인
gh pr list --state open --json number,title,headRefName

# 특정 PR 상세 정보
gh pr view [PR번호]

# PR의 변경 내용
gh pr diff [PR번호]
```

### 2. 코드 리뷰

변경된 파일들을 하나씩 검토합니다:
- 추가된 코드의 품질 확인
- docstring, 타입 힌트 확인
- 보안 이슈 확인

### 3. 리뷰 결과 제출

#### 방법 1: gh pr review (다른 사람의 PR)

```bash
# 승인
gh pr review [PR번호] --approve --body "[리뷰 내용]"

# 변경 요청
gh pr review [PR번호] --request-changes --body "[리뷰 내용]"
```

#### 방법 2: gh pr comment (자기 PR 또는 대체)

자기 PR에는 request-changes가 불가능하므로 comment를 사용합니다.

```bash
gh pr comment [PR번호] --body "[리뷰 내용]"
```

## 리뷰 코멘트 형식 (표준)

개발 Agent가 파싱할 수 있도록 **반드시 이 형식**을 사용하세요.

### 변경 요청 시

```markdown
## Review: Changes Requested

### 수정 필요
1. [구체적인 수정 사항]
2. [구체적인 수정 사항]

### 제안 사항 (선택)
- [개선 제안]

수정 후 다시 push 해주세요.

---
*Review by Claude Code (PR Reviewer Agent)*
```

### 승인 시

```markdown
## Review: Approved

### 확인 완료
- [확인된 항목 1]
- [확인된 항목 2]

LGTM! 코드 리뷰 완료.

---
*Review by Claude Code (PR Reviewer Agent)*
```

## Polling 모드 (Background 실행)

```
┌─────────────────────────────────────────────────┐
│  1. 시작 시 60초 대기 (PR 생성 대기)            │
│                                                 │
│  2. Loop (최대 10회):                           │
│     a. gh pr list --state open 확인             │
│     b. PR 있으면 → diff 확인 → 리뷰 제출        │
│     c. 30초 대기                                 │
│     d. PR 승인되면 종료                          │
└─────────────────────────────────────────────────┘
```

### Polling 코드 예시

```bash
# PR 상태 확인
gh pr view [PR번호] --json state --jq '.state'

# 최신 커밋 확인 (업데이트 감지)
gh pr view [PR번호] --json commits --jq '.commits[-1].oid'

# 리뷰 상태 확인
gh pr view [PR번호] --json reviews --jq '.reviews[-1].state'
```

## 개발 Agent와의 연동

1. **리뷰 Agent**가 리뷰 코멘트 남김
2. **개발 Agent**가 PR 코멘트 polling
3. "Changes Requested" 발견 시 → 수정 사항 파싱 → 코드 수정 → 재 push
4. **리뷰 Agent**가 다시 리뷰
5. "Approved" 되면 완료

## 체크리스트

- [ ] PR 변경 내용을 확인했는가?
- [ ] 리뷰 기준에 따라 검토했는가?
- [ ] 표준 형식으로 리뷰를 작성했는가?
- [ ] 구체적인 수정 사항을 명시했는가?

## 주의사항

- **표준 형식 사용** - 개발 Agent가 파싱할 수 있도록
- **구체적으로** - "코드 개선 필요" (X) → "docstring 추가 필요" (O)
- **자기 PR** - request-changes 불가, comment로 대체
