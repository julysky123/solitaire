---
name: dev-workflow
description: 실무 개발 워크플로우를 자동화합니다. 요구사항 정제 → 개발 → 테스트 → 클린&리팩토링 → 문서 업데이트 → Git feature branch 생성까지 수행합니다. "/feature [기능설명]" 또는 "/dev [기능설명]" 형태로 사용하세요.
allowed-tools: AskUserQuestion, Bash, Read, Write, Edit, Glob, Grep, TodoWrite, Task
user-invocable: true
---

# Dev Workflow Skill

## 개요

사용자의 요구사항을 받아 실무 개발 프로세스를 체계적으로 진행하는 skill입니다.

## 워크플로우 단계

### 1단계: 요구사항 정제 (Requirement Refinement)

사용자가 제공한 요구사항을 분석하고, 명확하지 않은 부분을 확인합니다.

**수행할 작업:**
- 사용자 요구사항을 분석하여 구현 가능한 태스크로 분해
- 기술적 애매함, 엣지 케이스, 미정의 동작 등을 식별
- 불명확한 부분이 있으면 `AskUserQuestion` 도구로 사용자에게 확인
- 모든 것이 명확해질 때까지 이 과정을 반복

**확인해야 할 사항 예시:**
- 입력/출력 형식이 명확한가?
- 에러 처리 방식이 정해졌는가?
- 기존 코드와의 통합 방식은?
- 성능/보안 요구사항이 있는가?

### 2단계: Git Feature Branch 생성

**수행할 작업:**
```bash
# 현재 브랜치 확인
git branch --show-current

# feature 브랜치 생성 및 체크아웃
git checkout -b feature/[기능명-kebab-case]
```

**브랜치 이름 규칙:**
- `feature/` 접두사 사용
- kebab-case 형식 (예: `feature/user-authentication`)
- 간결하고 명확하게

### 3단계: 개발 (Development)

**수행할 작업:**
- `TodoWrite`로 구현할 태스크 목록 생성
- 각 태스크를 순차적으로 구현
- 기존 코드 스타일과 패턴을 따름
- 각 태스크 완료 시 todo 상태 업데이트

**주의사항:**
- 코드를 수정하기 전에 반드시 `Read`로 기존 코드 확인
- 최소한의 변경으로 요구사항 충족
- 보안 취약점(OWASP Top 10) 주의

### 4단계: 테스트 (Testing)

**수행할 작업:**
- 기존 테스트가 있으면 실행하여 기존 기능 깨지지 않았는지 확인
- 새로운 기능에 대한 테스트 케이스 추가 (필요시)
- 테스트 실패 시 코드 수정 후 재실행

**테스트 실행 예시:**
```bash
# JavaScript/TypeScript
npm test

# Python
pytest

# Go
go test ./...
```

### 5단계: 클린 & 리팩토링 (Clean & Refactoring)

**수행할 작업:**
- 불필요한 코드, 주석, console.log 등 제거
- 코드 중복 제거 (단, 과도한 추상화는 피함)
- 변수/함수 이름이 명확한지 확인
- 린터/포매터 실행 (있는 경우)

**주의사항:**
- 리팩토링은 최소한으로 - 요청하지 않은 개선은 하지 않음
- 동작하는 코드를 망가뜨리지 않도록 주의

### 6단계: 문서 업데이트 (Documentation)

**수행할 작업:**
- 새로운 기능에 대한 문서가 필요한 경우에만 업데이트
- API 변경이 있으면 API 문서 업데이트
- README 업데이트가 필요한 경우에만 수정

**주의사항:**
- 문서는 요청된 경우에만 생성
- 기존 문서 스타일 유지

### 7단계: 커밋 및 완료 보고

**수행할 작업:**
```bash
# 변경사항 스테이징
git add .

# 커밋 (Co-Authored-By 포함)
git commit -m "feat: [기능 설명]

- 구현 내용 요약
- 주요 변경사항

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

**완료 보고:**
- 구현된 기능 요약
- 변경된 파일 목록
- 테스트 결과
- 다음 단계 안내 (PR 생성, merge 등)

## 사용 예시

```
/dev-workflow 사용자 로그인 기능 추가
/dev-workflow API에 캐싱 레이어 추가
/dev-workflow 버그 수정: 결제 실패 시 에러 메시지가 안 나옴
```

## 중요 원칙

1. **사용자 확인 우선**: 애매한 것은 가정하지 말고 물어보기
2. **최소 변경**: 요청한 것만 구현, 과도한 개선 금지
3. **안전 우선**: 보안 취약점 주의, 기존 기능 보호
4. **투명성**: 진행 상황을 todo로 명확히 공유
5. **Merge는 사람이**: 브랜치와 커밋까지만 하고, merge는 사용자가 직접
