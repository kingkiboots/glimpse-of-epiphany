# Supabase

`mobile-web`과 `projector-web`이 공유하는 단일 Supabase 프로젝트의 스키마를 관리합니다.
클라이언트 코드는 `packages/api`에 있습니다.

## 처음 세팅하기

`supabase` CLI는 루트 devDependency로 설치되어 있어 `pnpm exec supabase ...` 로 바로 씁니다.
전역 설치는 필요 없습니다.

### 1. 프로젝트 생성

[supabase.com/dashboard](https://supabase.com/dashboard)에서 프로젝트를 만듭니다.
region은 `Northeast Asia (Seoul)`을 권장합니다. 이때 정한 **DB 비밀번호**는 아래 `db push`에 필요하니 적어두세요.

### 2. 스키마 적용

**대시보드로 (가장 빠름)** — SQL Editor에서 `migrations/` 안의 `.sql`을 파일명 순서대로 붙여넣고 실행합니다.
마이그레이션은 전부 멱등(`if not exists` / `drop policy if exists`)하게 작성되어 있어 여러 번 실행해도 안전합니다.

**CLI로** — 로그인하면 브라우저가 열립니다.

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase db push
```

### 3. 환경변수

프로젝트 설정 > Data API 에서 **Project URL**과 **anon(publishable) key**를 복사합니다.

```bash
cp .env.example .env   # 레포 루트에서
```

두 앱의 `vite.config.ts`가 `envDir`을 루트로 잡고 있어 `.env` 한 벌을 공유합니다.
`service_role` 키를 넣으면 앱이 실행 시점에 예외를 던지니 주의하세요 (아래 "보안" 참고).

### 4. 관리자 계정

대시보드 > Authentication > Users > **Add user**로 계정 하나를 만듭니다.
"Auto Confirm User"를 켜야 메일 인증 없이 바로 로그인됩니다.
회원가입 경로는 앱에 두지 않았으므로, Authentication > Providers에서 **Email 가입은 꺼두세요.**

### 5. 파일 정리 함수 배포

행이 사라진 뒤 남는 Storage 파일을 지우는 Edge Function입니다.
`SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`는 런타임이 자동으로 주입하므로 따로 설정할 게 없습니다.

**배포는 GitHub Actions가 합니다.** `supabase/functions/**`가 바뀐 채로 `main`에 올라가면
[`.github/workflows/deploy-edge-functions.yml`](../.github/workflows/deploy-edge-functions.yml)이
자동으로 배포합니다. 로컬에 CLI를 설치하거나 대시보드에서 직접 편집할 필요가 없고,
레포의 코드와 실제 배포본이 어긋나지 않습니다.

최초 1회만 저장소 시크릿 두 개를 등록하세요 (Settings > Secrets and variables > Actions).

| 이름 | 값 |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | [account/tokens](https://supabase.com/dashboard/account/tokens)에서 발급한 개인 액세스 토큰 |
| `SUPABASE_PROJECT_ID` | 프로젝트 참조 문자열 (URL의 `<project-ref>`) |

코드 변경 없이 다시 배포하려면 Actions 탭에서 이 워크플로를 수동 실행하면 됩니다.

**그리고 배포와 별개로 스케줄 등록이 필요합니다.** 대시보드 > Integrations > **Cron**에서
이 함수를 **1분마다** 호출하도록 등록하세요. 이건 자동화되지 않는 1회성 설정입니다.
등록하지 않으면 화면에서는 5분 뒤 사라지지만 Storage 파일이 계속 쌓입니다.

### 6. 동작 확인

```bash
pnpm --filter mobile-web dev          # 데스크톱 브라우저
pnpm --filter mobile-web dev:host     # 같은 와이파이의 실제 폰에서 접속
pnpm --filter admin-web dev           # 운영자 화면
```

사진 선택 → 작성 완료 → 이미지 전시하기 까지 진행한 뒤,
대시보드의 Table Editor(`exhibits`)와 Storage(`exhibit-images`)에 각각 행과 webp 파일이 생겼는지 봅니다.

## 타입 재생성

`packages/api/src/database.types.ts`는 생성물입니다. 직접 수정하지 마세요.
파생 타입이 필요하면 `packages/api/src/types.ts`에 작성합니다.

```bash
pnpm exec supabase login              # 최초 1회
SUPABASE_PROJECT_ID=<project-ref> pnpm gen:db-types
```

`.env`에 `SUPABASE_PROJECT_ID`를 넣어뒀다면 `set -a; source .env; set +a` 후 `pnpm gen:db-types`만 실행해도 됩니다.

현재 커밋된 타입은 `migrations/`의 DDL과 이미 일치하므로, **처음 세팅할 때는 실행하지 않아도 됩니다.**
스키마를 바꾼 뒤에 돌리세요.

## 스키마 요약

| 대상 | 이름 | 설명 |
| --- | --- | --- |
| 테이블 | `public.exhibits` | 사진 경로 + 감사 메시지 한 건 |
| 버킷 | `exhibit-images` | 공개 버킷. webp만 허용, 파일당 1MB 제한 |
| 크론 | `delete-expired-exhibits` | 1분마다 5분 지난 행을 삭제 |
| 함수 | `cleanup-orphan-images` | 행이 없는 Storage 파일을 삭제 (Edge Function) |

`exhibits`는 Realtime 퍼블리케이션에 등록되어 있어 프로젝터가 INSERT와 DELETE를 구독합니다.

### 삭제 흐름

**이 테이블이 단일 진실 공급원이고, CDN 파일이 그 뒤를 따라옵니다.** 행이 사라지는 경로는 둘입니다.

1. 5분이 지나 `delete-expired-exhibits` 크론이 지움 (순수 SQL)
2. 운영자가 `admin-web`에서 지움

어느 쪽이든 결과는 "행이 없어졌다"로 같고, 남은 파일은 `cleanup-orphan-images`가 정리합니다.
삭제는 하드킬이라 되돌릴 수 없습니다. 소프트 삭제 플래그는 두지 않았습니다.

행 삭제를 Edge Function이 아니라 SQL 크론에 맡긴 이유는, 함수가 배포되지 않았거나 실패해도
"5분간만 전시된다"는 참가자와의 약속이 깨지지 않아야 하기 때문입니다.
함수가 죽으면 파일 정리만 밀리고 화면에서 사라지는 것은 보장됩니다.

### RLS 요약

참가자와 프로젝터는 anon 키만, 운영자는 로그인한 세션을 씁니다.

- 읽기: 전체 허용 (테이블, Storage 모두)
- 생성: anon도 INSERT 가능. 이게 참가자 업로드 경로입니다.
- 삭제: 테이블은 `authenticated`만. Storage는 아무에게도 열지 않았고, Edge Function이 RLS를 우회하는 `service_role`로 처리합니다.
- 수정: 아무에게도 열지 않았습니다. 한 번 올린 전시물은 수정 대상이 아닙니다.

anon에게 삭제를 열면 URL을 아는 참가자 누구나 전체 전시물을 지울 수 있습니다.

마이그레이션을 추가한 뒤에는 위 "타입 재생성"을 실행해 `packages/api`의 타입을 맞춰줍니다.

## 보안

### 무엇이 실제로 앱을 지키는가

`VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`는 **비밀이 아닙니다.** `VITE_` 접두사가 붙은 값은 빌드 시 번들에 문자열로 박히므로, 참가자가 모바일 웹에서 개발자 도구만 켜도 그대로 보입니다. Supabase도 그걸 전제로 설계했습니다.

따라서 이 앱을 지키는 건 키가 아니라 **위의 RLS 정책**입니다. 정책을 손볼 때는 anon이 INSERT 외의 권한을 얻지 않는지 반드시 확인하세요.

### 절대 커밋하면 안 되는 것

- `service_role` 키 — RLS를 통째로 우회합니다. 클라이언트 코드에는 어떤 이유로도 들어갈 일이 없습니다.
- Personal Access Token — 계정 전체 권한입니다.

이 둘에 `VITE_` 접두사를 붙이는 순간 번들에 실려 나갑니다. 실수를 막기 위해 `packages/env`가 값을 읽을 때 키 종류를 검사하고(`src/assert-publishable-key.ts`), 비밀 키가 감지되면 즉시 예외를 던집니다.

`packages/env`는 값에 섞인 공백·줄바꿈도 걷어냅니다(`src/sanitize-env-value.ts`). 대시보드에 긴 키를 붙여넣다 줄이 접히면, 이 값이 매 요청의 HTTP 헤더로 들어가기 때문에 첫 요청에서 `Failed to execute 'set' on 'Headers': Invalid value` 라는 정체불명의 에러만 남습니다.

### Supabase MCP를 쓰지 않는 이유

이 레포는 MCP로 DB에 연결하지 않고 마이그레이션 파일로만 스키마를 관리합니다. 의도된 선택입니다.

- `exhibits.message`는 참가자가 자유롭게 쓰는 텍스트라, MCP로 조회하면 그 내용이 그대로 LLM의 입력이 됩니다. [프롬프트 인젝션](https://supabase.com/docs/guides/getting-started/mcp#prompt-injection)의 전형적인 형태입니다.
- 행사 당일에는 이 DB가 곧 프로덕션이라 "개발 프로젝트에만 연결하라"는 권고를 지키기 어렵습니다.
- MCP에는 계정 전체 권한을 가진 Personal Access Token이 필요한데, 테이블 하나를 만들자고 감수할 위험이 아닙니다.
- 마이그레이션 파일로 관리하면 스키마 변경 이력이 git에 남아 리뷰와 재현이 가능합니다. MCP로 DDL을 직접 적용하면 실제 DB와 레포가 어긋나기 시작합니다.

### 운영 시 참고

anon 키가 공개되는 구조라 URL을 아는 사람은 누구나 INSERT를 시도할 수 있습니다. 폐쇄된 수련회 환경이라 실질적 위험은 낮지만, 행사가 끝나면 대시보드에서 INSERT 정책을 내려 추가 업로드를 막는 편이 좋습니다.
