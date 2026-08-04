# @packages/api

> 세 앱이 공유하는 Supabase 클라이언트와 도메인 API

## 역할

이 프로젝트에는 백엔드 서버가 없습니다. 세 앱이 Supabase와 직접 통신하는데,
그 통신 방법을 **각 앱이 따로 알 필요가 없도록** 여기에 모았습니다.

앱은 `createExhibit`, `deleteExhibit` 같은 도메인 언어로 호출하고,
테이블 이름이나 컬럼 이름은 이 패키지 밖으로 새지 않습니다.

**하지 않는 일**

- 환경변수 읽기·검증 → [`@packages/env`](../env)
- 화면 상태 관리 → 각 앱의 `features` / `entities`
- 이미지 압축 → `apps/mobile-web/src/shared/lib/image`

## 공개 API

`index.ts`가 유일한 진입점입니다. `src/` 내부 파일을 직접 import하지 마세요.

### 클라이언트

| 이름 | 설명 |
| --- | --- |
| `getSupabaseClient()` | Supabase 클라이언트 싱글턴. 최초 호출 시점에 생성 |

### 전시물

| 이름 | 설명 |
| --- | --- |
| `createExhibit({ imageFile, message, clientId })` | 이미지를 Storage에 올리고 레코드 생성 |
| `fetchExhibits(limit?)` | 최신순 조회 (기본 100건) |
| `deleteExhibit(id)` | 하드 삭제. RLS상 로그인한 운영자만 성공 |
| `subscribeToExhibits({ onInsert, onDelete })` | Realtime 구독. 반환된 함수로 해제 |
| `getExhibitImageUrl(path)` | Storage 경로 → CDN 공개 URL |
| `EXHIBIT_IMAGE_BUCKET` | 버킷 이름 |

### 인증 (운영자)

| 이름 | 설명 |
| --- | --- |
| `signInAdmin(email, password)` | 로그인. 실패 시 예외 |
| `signOutAdmin()` | 로그아웃 |
| `getCurrentSession()` | 저장된 세션 조회 |
| `subscribeToAuthState(onChange)` | 로그인 상태 변화 구독 |

### 타입

`Exhibit`, `CreateExhibitInput`, `ExhibitSubscriptionHandlers`, `ExhibitRow`, `ExhibitInsert`, `Database`, `Json`, `Session`

## 사용 예

```ts
import { createExhibit, subscribeToExhibits } from "@packages/api";

// 업로드 (mobile-web)
await createExhibit({ imageFile, message, clientId });

// 실시간 구독 (projector-web)
const unsubscribe = subscribeToExhibits({
  onInsert: (exhibit) => queue.push(exhibit),
  onDelete: (id) => queue.remove(id),
});
```

## 설계 노트

**클라이언트를 최초 호출 시점에 만듭니다.** 모듈을 import하는 것만으로 환경변수를
요구하면, 값이 없는 환경에서 앱이 화면조차 띄우지 못합니다.

**`Session` 타입을 재노출합니다.** 앱이 `@supabase/supabase-js`를 직접 import하지
않도록 하기 위해서입니다. Supabase 접근 경로를 이 패키지 하나로 좁혀둡니다.

**`database.types.ts`는 생성물입니다.** `pnpm gen:db-types`가 덮어쓰므로 직접
수정하지 마세요. 파생 타입은 `src/types.ts`에 작성합니다.

**Realtime DELETE는 기본키만 옵니다.** 테이블의 replica identity가 기본값이라
`onDelete`가 `id`만 받습니다. 큐에서 제거하는 데는 충분해서 그대로 두었습니다.

## 의존 관계

```
@packages/api
├── @packages/env      환경변수
├── @packages/utils    randomUuid
└── @supabase/supabase-js
```

관련 문서: [supabase/README.md](../../supabase/README.md) (스키마·RLS·운영)
