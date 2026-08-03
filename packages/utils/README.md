# @packages/utils

> 앱과 패키지가 함께 쓰는 순수 유틸 함수

## 역할

**부수 효과가 없고 어떤 도메인에도 속하지 않는 함수**만 둡니다.
React에 의존하지 않고, Supabase도 모르고, 브라우저 API 외에는 아무것도 import하지 않습니다.

**하지 않는 일**

- React 훅 → 각 앱의 `shared/lib`
- 도메인 로직 (전시물, 인증) → [`@packages/api`](../api)
- 환경변수 → [`@packages/env`](../env)

> 여기에 무언가를 추가하기 전에 **"두 곳 이상에서 쓰는가"** 를 먼저 확인하세요.
> 한 곳에서만 쓴다면 그 앱의 `shared/lib`가 맞는 자리입니다.

## 공개 API

| 이름 | 시그니처 | 설명 |
| --- | --- | --- |
| `cn` | `(...classNames) => string` | 조건부 클래스명 결합 |
| `getCurrentDate` | `() => string` | 오늘 날짜를 `yyyy.MM.dd`로 |
| `randomUuid` | `() => string` | RFC 4122 v4 UUID |

## 사용 예

```ts
import { cn, getCurrentDate, randomUuid } from "@packages/utils";

<div className={cn(styles.root, isActive && styles.active)} />

const imagePath = `${randomUuid()}.webp`;
```

## 설계 노트

**`randomUuid`가 왜 필요한가** — `crypto.randomUUID()`는 **보안 컨텍스트(https 또는
localhost)에서만 존재합니다.** 폰에서 http로 LAN 접속해 테스트할 때(`dev:host`)는
함수 자체가 없어서 터집니다.

보안 컨텍스트에서는 네이티브를 그대로 쓰고, 아니면 비보안 컨텍스트에서도 사용 가능한
`crypto.getRandomValues`로 v4 UUID를 직접 조립합니다.

**`cn`은 의존성 없이 직접 구현했습니다.** `clsx` 같은 라이브러리가 제공하는 객체 문법이나
중첩 배열을 이 프로젝트에서는 쓰지 않아, 필요한 만큼만 세 줄로 두었습니다.

## 의존 관계

의존하는 패키지가 없습니다. 다른 패키지와 앱이 이곳에 의존합니다.
