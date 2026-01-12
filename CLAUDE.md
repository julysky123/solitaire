# Project Context

## Repository
- **GitHub**: https://github.com/julysky123/solitaire
- **Main Branch**: master

## Git Conventions

### Branch Strategy
- Feature 개발: `feature/기능명` 브랜치 생성
- master로 merge 시: **항상 squash merge** 사용
- merge 후 feature 브랜치 삭제

### Commit Message
```
<type>: <subject>

<body>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

Types: feat, fix, refactor, docs, test, chore

## Project Structure

```
new_service1/
├── .claude/
│   └── skills/           # Claude Code skills
│       ├── dev-workflow/ # 개발 워크플로우 자동화
│       ├── pr-reviewer/  # PR 리뷰 자동화
│       └── hello-world/  # 예제 skill
├── freecell/             # 프리셀 게임 (Vanilla JS)
│   ├── index.html
│   ├── style.css
│   └── game.js
└── src/                  # 기타 소스코드
```

## Available Skills

### /dev-workflow (또는 /feature)
실무 개발 워크플로우 자동화:
1. 요구사항 정제
2. Feature branch 생성
3. 개발 (TodoWrite로 진행상황 관리)
4. 테스트
5. 클린업
6. 문서 업데이트
7. 커밋 & Push
8. PR 생성
9. 리뷰 대응

### /pr-reviewer
GitHub PR 자동 리뷰:
- 코드 품질, 문서화, 버그 가능성, 보안 검토
- 표준 형식으로 리뷰 코멘트 작성

## FreeCell Game Features
- 드래그 앤 드롭 (60px 스냅 기능)
- 슈퍼무브: (빈 프리셀 + 1) × (빈 캐스케이드 + 1)장 동시 이동
- 실행취소, 자동완성, 타이머
