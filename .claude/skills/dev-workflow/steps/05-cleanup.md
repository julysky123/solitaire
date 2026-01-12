# 5단계: 클린업 & 리팩토링

## 목표

코드를 깔끔하게 정리하고, 불필요한 것들을 제거합니다.

## 수행 절차

### 1. 디버깅 코드 제거

```javascript
// 제거해야 할 것들
console.log('debug:', data);
print(f"DEBUG: {value}")
fmt.Println("debug:", value)
```

### 2. 불필요한 주석 제거

```javascript
// 제거해야 할 것들
// TODO: 나중에 수정
// 이거 왜 있지?
// console.log(data);  <- 주석 처리된 코드

// 남겨둬야 할 것들
// 복잡한 비즈니스 로직 설명
// 외부 API 문서 링크
// 의도적인 workaround 설명
```

### 3. 코드 포맷팅

```bash
# JavaScript/TypeScript
npm run format
# 또는
npx prettier --write .

# Python
black .
# 또는
ruff format .

# Go
go fmt ./...
```

### 4. 린터 실행

```bash
# JavaScript/TypeScript
npm run lint
# 또는
npx eslint --fix .

# Python
ruff check --fix .
# 또는
flake8 .

# Go
golint ./...
```

### 5. 사용하지 않는 코드 제거

```
확인할 것:
- 사용하지 않는 import/require
- 사용하지 않는 변수
- 사용하지 않는 함수
- 도달 불가능한 코드
```

## 리팩토링 범위

### DO (해야 할 것)

- 방금 작성한 코드의 정리
- 명백한 코드 중복 제거
- 너무 긴 함수 분리 (내가 작성한 것만)

### DON'T (하지 말 것)

- 기존 코드 리팩토링 (요청하지 않은 경우)
- 과도한 추상화
- 아키텍처 변경
- "개선"이라는 명목의 불필요한 수정

## 체크리스트

- [ ] console.log/print 등 디버깅 코드 제거
- [ ] 불필요한 주석 제거
- [ ] 린터/포매터 실행
- [ ] 사용하지 않는 import 제거
- [ ] 테스트가 여전히 통과하는가?

## 주의사항

- **테스트 재실행** - 정리 후 테스트가 깨지지 않았는지 확인
- **최소한으로** - 요청하지 않은 개선은 하지 않음
- **동작 유지** - 정리는 동작을 변경하지 않아야 함
