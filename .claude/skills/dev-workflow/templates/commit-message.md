# 커밋 메시지 템플릿

## 형식

```
<type>: <subject>

<body>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Type (타입)

| 타입 | 설명 | 예시 |
|------|------|------|
| `feat` | 새로운 기능 | 로그인 기능 추가 |
| `fix` | 버그 수정 | 결제 오류 수정 |
| `refactor` | 리팩토링 | 코드 구조 개선 |
| `docs` | 문서 수정 | README 업데이트 |
| `test` | 테스트 추가/수정 | 단위 테스트 추가 |
| `chore` | 빌드, 설정 변경 | 패키지 업데이트 |

## Subject (제목)

- 50자 이내
- 한글 또는 영어 (프로젝트 컨벤션 따름)
- 명령형으로 작성 ("추가" O, "추가했음" X)
- 마침표 없음

## Body (본문)

- 무엇을 왜 변경했는지 설명
- 목록 형식 권장 (-)
- 각 항목은 간결하게

## 예시

### 기능 추가

```
feat: 사용자 로그인 기능 추가

- UserService에 login 메서드 추가
- /api/auth/login 엔드포인트 생성
- JWT 토큰 발급 구현

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### 버그 수정

```
fix: 결제 실패 시 에러 메시지 미표시 수정

- PaymentError를 catch하여 사용자에게 표시
- 에러 로깅 추가

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### 리팩토링

```
refactor: UserService 코드 정리

- 중복 코드 제거
- 메서드 분리로 가독성 개선

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Git 명령어

```bash
# HEREDOC 사용 (권장)
git commit -m "$(cat <<'EOF'
feat: 기능 설명

- 변경사항 1
- 변경사항 2

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```
