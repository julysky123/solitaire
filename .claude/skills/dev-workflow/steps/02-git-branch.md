# 2단계: Git Feature Branch 생성

## 목표

작업을 위한 독립적인 feature 브랜치를 생성합니다.

## 수행 절차

### 1. 현재 상태 확인

```bash
# 현재 브랜치 확인
git branch --show-current

# 작업 디렉토리 상태 확인
git status
```

### 2. 최신 코드 동기화 (원격 저장소가 있는 경우)

```bash
# master/main 브랜치로 이동
git checkout master

# 최신 코드 가져오기
git pull origin master
```

### 3. Feature 브랜치 생성

```bash
git checkout -b feature/[기능명-kebab-case]
```

## 브랜치 이름 규칙

### 형식

```
feature/[기능명-kebab-case]
```

### 예시

| 기능 | 브랜치 이름 |
|------|-------------|
| 사용자 로그인 | `feature/user-login` |
| API 캐싱 추가 | `feature/api-caching` |
| 결제 버그 수정 | `feature/fix-payment-error` |
| 다크모드 지원 | `feature/dark-mode-support` |

### 규칙

- `feature/` 접두사 필수
- 영문 소문자 + 하이픈(kebab-case)
- 간결하고 명확하게 (2-4 단어)
- 한글 사용 금지

## 체크리스트

- [ ] 현재 브랜치 상태를 확인했는가?
- [ ] 작업 중인 변경사항이 없는가?
- [ ] 브랜치 이름이 규칙에 맞는가?
- [ ] 브랜치가 정상적으로 생성되었는가?

## 주의사항

- 작업 중인 변경사항이 있으면 먼저 stash하거나 커밋
- 이미 같은 이름의 브랜치가 있으면 다른 이름 사용
- master/main에서 직접 작업하지 않기
