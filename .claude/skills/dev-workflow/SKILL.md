---
name: dev-workflow
description: 실무 개발 워크플로우를 자동화합니다. 요구사항 정제 → 개발 → 테스트 → 클린&리팩토링 → 문서 업데이트 → Git feature branch 생성 → Push → PR 생성까지 수행합니다. "/feature [기능설명]" 또는 "/dev [기능설명]" 형태로 사용하세요.
allowed-tools: AskUserQuestion, Bash, Read, Write, Edit, Glob, Grep, TodoWrite, Task
user-invocable: true
---

# Dev Workflow Skill

실무 개발 프로세스를 체계적으로 진행하는 skill입니다.

## 워크플로우 개요

```
1. 요구사항 정제  →  애매하면 사용자에게 확인 (반복)
2. Git Branch     →  feature/기능명 브랜치 생성
3. 개발          →  TodoWrite로 태스크 관리하며 구현
4. 테스트        →  기존 테스트 실행 + 필요시 추가
5. 클린업        →  불필요한 코드 제거
6. 문서          →  필요한 경우에만 업데이트
7. 커밋 & Push   →  변경사항 커밋 후 원격에 Push
8. PR 생성       →  GitHub PR 생성 + 자동 리뷰 실행 (백그라운드)
9. 리뷰 대응     →  변경요청 시 수정 후 재push (반복) → 승인되면 완료
```

> **자동 리뷰**: PR 생성 후 백그라운드 agent가 자동으로 코드 리뷰를 수행합니다.

## 상세 가이드

각 단계의 상세 가이드는 아래 파일들을 참조하세요:

- [1단계: 요구사항 정제](./steps/01-requirements.md)
- [2단계: Git Branch 생성](./steps/02-git-branch.md)
- [3단계: 개발](./steps/03-development.md)
- [4단계: 테스트](./steps/04-testing.md)
- [5단계: 클린업 & 리팩토링](./steps/05-cleanup.md)
- [6단계: 문서 업데이트](./steps/06-documentation.md)
- [7단계: 커밋 & Push](./steps/07-commit.md)
- [8단계: PR 생성](./steps/08-pull-request.md)
- [9단계: 리뷰 대응](./steps/09-review-response.md)

## 템플릿

- [커밋 메시지 템플릿](./templates/commit-message.md)
- [PR 템플릿](./templates/pull-request.md)

## 핵심 원칙

1. **사용자 확인 우선** - 애매한 것은 가정하지 말고 물어보기
2. **최소 변경** - 요청한 것만 구현, 과도한 개선 금지
3. **안전 우선** - 보안 취약점 주의, 기존 기능 보호
4. **투명성** - 진행 상황을 todo로 명확히 공유
5. **Merge는 사람이** - PR 생성까지만, merge는 사용자가 직접

## Git 규칙

### Merge 전략
- master로 merge 시 **항상 squash merge** 사용
- `git merge --squash feature/브랜치명`
- merge 후 feature 브랜치 삭제 (local + remote)

### 브랜치 삭제
```bash
git branch -d feature/브랜치명           # 로컬 삭제
git push origin --delete feature/브랜치명  # 원격 삭제
```
