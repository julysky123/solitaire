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

### 2. 버그/에러 가능성
- 명백한 버그가 있는가?
- 엣지 케이스를 처리하는가?
- 에러 처리가 적절한가?

### 3. 보안
- 보안 취약점이 있는가? (SQL injection, XSS 등)
- 민감 정보가 노출되는가?

### 4. 테스트
- 테스트가 충분한가?
- 테스트가 의미 있는가?

## 수행 절차

### 1. PR 정보 확인

```bash
# 열린 PR 목록 확인
gh pr list --state open

# 특정 PR 상세 정보
gh pr view [PR번호]

# PR의 변경된 파일 목록
gh pr diff [PR번호] --name-only

# PR의 변경 내용
gh pr diff [PR번호]
```

### 2. 코드 리뷰

변경된 파일들을 하나씩 검토합니다:
- 추가된 코드의 품질 확인
- 삭제된 코드가 적절한지 확인
- 수정된 로직이 올바른지 확인

### 3. 리뷰 결과 제출

#### 승인 (Approve)

```bash
gh pr review [PR번호] --approve --body "$(cat <<'EOF'
## Review Result: Approved

코드 리뷰를 완료했습니다.

### 확인 사항
- [ ] 코드 품질: 양호
- [ ] 버그/에러: 발견되지 않음
- [ ] 보안: 문제 없음

LGTM!
EOF
)"
```

#### 변경 요청 (Request Changes)

```bash
gh pr review [PR번호] --request-changes --body "$(cat <<'EOF'
## Review Result: Changes Requested

다음 사항을 수정해주세요:

### 수정 필요 사항
1. [구체적인 수정 사항]
2. [구체적인 수정 사항]

### 제안 사항
- [개선 제안]
EOF
)"
```

## Polling 모드

백그라운드에서 실행될 때의 동작:

```
1. gh pr list --state open 으로 열린 PR 확인
2. 새로운 PR 또는 업데이트된 PR이 있으면 리뷰
3. 리뷰 결과 제출
4. 30초 대기 후 1번으로 돌아감
5. PR이 승인되면 종료
```

## 리뷰 코멘트 형식

### 승인 시
```
## Review: Approved

- 코드 품질 양호
- 테스트 확인됨
- 보안 이슈 없음

LGTM!
```

### 변경 요청 시
```
## Review: Changes Requested

### 문제점
1. [파일:라인] - 문제 설명

### 수정 방법
- 구체적인 수정 가이드
```
