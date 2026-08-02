# Supabase

`mobile-web`과 `projector-web`이 공유하는 단일 Supabase 프로젝트의 스키마를 관리합니다.
클라이언트 코드는 `packages/api`에 있습니다.

## 스키마 적용

Supabase CLI가 없다면 대시보드에서 붙여넣는 방식이 가장 빠릅니다.

1. [supabase.com](https://supabase.com/dashboard)에서 프로젝트를 만듭니다. (region은 `Northeast Asia (Seoul)` 권장)
2. 대시보드 > SQL Editor 에서 `migrations/` 안의 `.sql` 파일을 파일명 순서대로 실행합니다.
3. 프로젝트 설정 > Data API 에서 **Project URL**과 **anon public key**를 복사합니다.
4. 레포 루트의 `.env.example`을 `.env`로 복사한 뒤 위 값을 채웁니다.
   두 앱의 `vite.config.ts`가 `envDir`을 루트로 잡고 있어 `.env` 한 벌을 공유합니다.

CLI를 쓴다면 (`supabase`는 `@packages/api`의 devDependency로 설치되어 있습니다):

```bash
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase db push
```

## 타입 재생성

스키마를 바꾼 뒤에는 아래 명령으로 `packages/api/src/database.types.ts`를 다시 뽑습니다.
직접 수정하지 마세요. 파생 타입이 필요하면 `packages/api/src/types.ts`에 작성합니다.

```bash
SUPABASE_PROJECT_ID=<project-ref> pnpm gen:db-types
```

`.env`에 `SUPABASE_PROJECT_ID`를 넣어뒀다면 `set -a; source .env; set +a` 후 `pnpm gen:db-types`만 실행해도 됩니다.

## 스키마 요약

| 대상 | 이름 | 설명 |
| --- | --- | --- |
| 테이블 | `public.exhibits` | 사진 경로 + 감사 메시지 한 건 |
| 버킷 | `exhibit-images` | 공개 버킷. webp만 허용, 파일당 1MB 제한 |

`exhibits`는 Realtime 퍼블리케이션에 등록되어 있어 프로젝터가 INSERT를 구독할 수 있습니다.

### RLS 요약

anon 키만 사용하므로 권한은 전부 RLS로 통제합니다.

- 읽기: `is_hidden = false`인 행만 (테이블), 버킷 전체 (Storage)
- 쓰기: INSERT만 허용. `is_hidden = true`로는 만들 수 없습니다.
- 수정/삭제: anon에게 열어주지 않았습니다. 부적절한 게시물은 운영자가 대시보드에서 `is_hidden`을 `true`로 바꿔 화면에서 내립니다.

마이그레이션을 추가한 뒤에는 위 "타입 재생성"을 실행해 `packages/api`의 타입을 맞춰줍니다.

## 보안

### 무엇이 실제로 앱을 지키는가

`VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`는 **비밀이 아닙니다.** `VITE_` 접두사가 붙은 값은 빌드 시 번들에 문자열로 박히므로, 참가자가 모바일 웹에서 개발자 도구만 켜도 그대로 보입니다. Supabase도 그걸 전제로 설계했습니다.

따라서 이 앱을 지키는 건 키가 아니라 **위의 RLS 정책**입니다. 정책을 손볼 때는 anon이 INSERT 외의 권한을 얻지 않는지 반드시 확인하세요.

### 절대 커밋하면 안 되는 것

- `service_role` 키 — RLS를 통째로 우회합니다. 클라이언트 코드에는 어떤 이유로도 들어갈 일이 없습니다.
- Personal Access Token — 계정 전체 권한입니다.

이 둘에 `VITE_` 접두사를 붙이는 순간 번들에 실려 나갑니다. 실수를 막기 위해 `packages/api`가 클라이언트를 만들기 전에 키 종류를 검사하고(`src/assert-publishable-key.ts`), 비밀 키가 감지되면 즉시 예외를 던집니다.

### Supabase MCP를 쓰지 않는 이유

이 레포는 MCP로 DB에 연결하지 않고 마이그레이션 파일로만 스키마를 관리합니다. 의도된 선택입니다.

- `exhibits.message`는 참가자가 자유롭게 쓰는 텍스트라, MCP로 조회하면 그 내용이 그대로 LLM의 입력이 됩니다. [프롬프트 인젝션](https://supabase.com/docs/guides/getting-started/mcp#prompt-injection)의 전형적인 형태입니다.
- 행사 당일에는 이 DB가 곧 프로덕션이라 "개발 프로젝트에만 연결하라"는 권고를 지키기 어렵습니다.
- MCP에는 계정 전체 권한을 가진 Personal Access Token이 필요한데, 테이블 하나를 만들자고 감수할 위험이 아닙니다.
- 마이그레이션 파일로 관리하면 스키마 변경 이력이 git에 남아 리뷰와 재현이 가능합니다. MCP로 DDL을 직접 적용하면 실제 DB와 레포가 어긋나기 시작합니다.

### 운영 시 참고

anon 키가 공개되는 구조라 URL을 아는 사람은 누구나 INSERT를 시도할 수 있습니다. 폐쇄된 수련회 환경이라 실질적 위험은 낮지만, 행사가 끝나면 대시보드에서 INSERT 정책을 내려 추가 업로드를 막는 편이 좋습니다.
