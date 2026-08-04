# Supabase

`mobile-web`, `projector-web`, `admin-web`이 공유하는 단일 Supabase 프로젝트의 스키마를 관리합니다.
클라이언트 코드는 `packages/api`, 환경변수는 `packages/env`에 있습니다.

세팅 중에 막히면 아래 [문제 해결](#문제-해결)을 먼저 보세요.

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

세 앱의 `vite.config.ts`가 `envDir`을 루트로 잡고 있어 `.env` 한 벌을 공유합니다.
`service_role` 키를 넣으면 앱이 실행 시점에 예외를 던지니 주의하세요 (아래 "보안" 참고).

### 4. 관리자 계정

`admin-web`에는 **가입 화면이 없습니다.** 계정은 대시보드에서 직접 발급합니다.

1. Authentication > Users > **Add user** > Create new user
2. 이메일과 비밀번호를 넣고 **"Auto Confirm User"를 켭니다.** 끄면 메일 인증을 기다리느라 로그인되지 않습니다.
3. Authentication > Sign In / Providers > Email 에서 **가입 허용을 꺼둡니다.**

3번이 중요합니다. RLS상 전시물 삭제 권한이 `authenticated` 롤에 열려 있어서, 가입이 열려 있으면
누구나 계정을 만들어 사진을 지울 수 있습니다. 앱 코드로는 막을 수 없고 이 설정으로만 닫힙니다.

같은 안내가 로그인 화면의 `(?)` 버튼에도 들어 있습니다.

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

**그리고 배포와 별개로 스케줄 등록이 필요합니다.** 등록하지 않으면 운영자가 사진을 내려도
Storage 파일이 계속 남습니다. 자동화되지 않는 1회성 설정입니다.

대시보드 > Integrations > **Cron** > Create job 에서 아래처럼 만듭니다.

| 항목 | 값 |
| --- | --- |
| 이름 | `cleanup-orphan-images` |
| 스케줄 | `*/5 * * * *` (5분마다) |
| 유형 | Supabase Edge Function → `cleanup-orphan-images`, POST |
| 타임아웃 | `30000` ms |
| HTTP 헤더 | `Authorization: Bearer <anon 키>` |

유형 선택지에 Edge Function이 없다면 `pg_net`이 꺼져 있는 것입니다.
`migrations/20260803000000_enable_pg_net.sql`을 실행하거나 Database > Extensions에서 켜주세요.

**`Authorization` 헤더에는 anon 키를 넣습니다.** Edge Function은 기본적으로 JWT를 검증하므로
값이 없거나 틀리면 매번 401로 실패합니다. 크론은 도는데 아무것도 지워지지 않는, 알아채기 어려운
상태가 됩니다. 붙여넣을 때 줄바꿈이 끼지 않게 주의하세요.

`service_role` 키를 쓰지 마세요. 되긴 하지만 이득이 없고 손해만 있습니다. 이 헤더는 JWT 검증을
통과하는 용도일 뿐이고, 함수가 실제로 쓰는 권한은 런타임이 주입하는 `SUPABASE_SERVICE_ROLE_KEY`로
따로 얻습니다. 반면 크론 정의는 `cron.job` 테이블에 문자열로 저장되므로, DB를 볼 수 있는 사람
누구나 읽을 수 있는 자리에 최고 권한 키를 두게 됩니다. anon 키는 어차피 공개되는 값이라 무해합니다.

anon 키가 `sb_publishable_`로 시작하는 신형 포맷이면 JWT가 아니라 검증을 통과하지 못할 수 있습니다.
401이 나면 Project Settings > API Keys 아래 **Legacy API keys** 섹션의 `anon public`
(`eyJ`로 시작하는 값)으로 바꿔보세요.

**타임아웃은 30초로 둡니다.** 정리가 정상적으로 돌면 1초 안에 끝나지만, 밀린 파일이 한꺼번에
걸리는 첫 실행을 위한 여유입니다. 기준은 **타임아웃 < 실행 주기** — 주기(5분)보다 길면 앞 실행이
끝나기 전에 다음 실행이 시작돼 요청이 겹쳐 쌓입니다. 중간에 잘려도 함수는 매번 처음부터 다시
훑는 방식이라 다음 실행이 남은 것을 이어서 지웁니다.

**주기를 1분이 아니라 5분으로 둔 이유**는, 운영자가 삭제를 누르면 DB 행이 즉시 사라지고
화면에서도 Realtime으로 곧바로 내려가기 때문입니다. 파일 정리는 그 뒤를 따라오는 청소라서
늦어도 화면에 영향이 없습니다. 1분으로 두면 대부분 지울 것이 없는 헛수고만 늘어납니다.
참고로 1분 주기여도 월 43,200회로 무료 한도(50만 회)의 9% 수준이라, 과금이 이유는 아닙니다.

등록한 뒤 확인은 이렇게 합니다.

```sql
select jobname, schedule, active from cron.job;
select jobname, status, start_time from cron.job_run_details order by start_time desc limit 10;
```

여기서 `succeeded`는 **SQL이 요청을 보냈다는 뜻이지 함수가 성공했다는 뜻이 아닙니다.**
`net.http_post`는 응답을 기다리지 않습니다. 함수가 실제로 무엇을 했는지는
Edge Functions > `cleanup-orphan-images` > **Logs**에서 `{"scanned":…,"deleted":…}`로 확인하세요.

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
| 함수 | `cleanup-orphan-images` | 행이 없는 Storage 파일을 삭제 (Edge Function) |

`exhibits`는 Realtime 퍼블리케이션에 등록되어 있어 프로젝터가 INSERT와 DELETE를 구독합니다.

### 삭제 흐름

**이 테이블이 단일 진실 공급원이고, CDN 파일이 그 뒤를 따라옵니다.**

행이 사라지는 경로는 **운영자가 `admin-web`에서 지우는 것 하나뿐**입니다. 자동 만료는 두지
않았습니다(`20260804000000_drop_exhibit_expiry.sql`에서 걷어냈습니다). 올라온 사진은 누군가
내리기 전까지 남습니다.

행이 사라지면 남은 파일은 `cleanup-orphan-images`가 정리합니다. 삭제는 하드킬이라 되돌릴 수
없습니다. 소프트 삭제 플래그는 두지 않았습니다.

파일 삭제만 Edge Function에 맡긴 이유는 **Storage 파일을 SQL로 지울 수 없기 때문**입니다.
함수가 죽어 있어도 행은 이미 지워져 화면에서는 내려가고, 눈에 보이지 않는 파일 정리만 밀립니다.

### RLS 요약

참가자와 프로젝터는 anon 키만, 운영자는 로그인한 세션을 씁니다.

- 읽기: 전체 허용 (테이블, Storage 모두)
- 생성: anon도 INSERT 가능. 이게 참가자 업로드 경로입니다.
- 삭제: 테이블은 `authenticated`만. Storage는 아무에게도 열지 않았고, Edge Function이 RLS를 우회하는 `service_role`로 처리합니다.
- 수정: 아무에게도 열지 않았습니다. 한 번 올린 전시물은 수정 대상이 아닙니다.

anon에게 삭제를 열면 URL을 아는 참가자 누구나 전체 전시물을 지울 수 있습니다.

마이그레이션을 추가한 뒤에는 위 "타입 재생성"을 실행해 `packages/api`의 타입을 맞춰줍니다.

## 문제 해결

실제로 겪은 것들입니다. 증상으로 찾으세요.

### DB 행은 사라지는데 Storage 파일이 그대로 쌓인다

행 삭제와 파일 삭제는 **서로 다른 것이 담당**합니다. 행은 운영자가 `admin-web`에서 누르는
즉시 지워지지만, 파일은 `cleanup-orphan-images` Edge Function이 지우고 이건 **배포와 크론
등록이 각각 필요**합니다. 둘 중 하나라도 빠지면 정확히 이 증상이 납니다.
위 "5. 파일 정리 함수 배포"를 확인하세요.

Storage 파일은 SQL로 지울 수 없어서 갈라놓은 구조입니다. `storage.objects`에서 행을 지워도
실제 파일은 남습니다.

이미 쌓인 파일은 Storage > `exhibit-images`에서 전체 선택 후 지우면 됩니다.
DB에 대응하는 행이 없으니 아무도 참조하지 않는 파일들입니다.

### 크론은 도는데 아무것도 지워지지 않는다

`Authorization` 헤더 문제일 가능성이 큽니다. 401이 나도 `cron.job_run_details`에는
`succeeded`로 찍히기 때문에 SQL 쪽만 보면 정상으로 보입니다.
Edge Functions > Logs에서 실제 응답을 확인하세요.

### Cron UI에서 "Supabase Edge Function" 유형을 고를 수 없다

`pg_net` 확장이 꺼져 있습니다. 크론이 함수를 호출할 때 내부적으로 `net.http_post`를 쓰기 때문입니다.

```sql
create extension if not exists pg_net;
```

### GitHub Actions가 "Access token not provided"로 실패한다

시크릿이 비어서 전달된 것입니다. GitHub에는 이름이 비슷한 저장소가 세 군데 있고 서로 다릅니다.

- **Repository secrets** — 모든 워크플로가 `secrets.X`로 바로 읽습니다. **여기에 넣으세요.**
- **Environment secrets** — job이 `environment: <이름>`을 선언해야만 읽힙니다. 없으면 조용히 빈 값이 됩니다.
- **Variables 탭** — `secrets.X`가 아니라 `vars.X`로 읽어야 합니다.

CLI 메시지의 "environment variable"은 GitHub의 Environment와 무관한, 러너 셸의 환경변수를 말합니다.
워크플로는 이미 그것을 설정하고 있고, 채워줄 시크릿이 비어 있는 것이 원인입니다.

### 배포한 앱에서 `Failed to execute 'set' on 'Headers': Invalid value`

anon 키 **중간에 줄바꿈**이 들어간 경우입니다. 이 값은 매 요청의 HTTP 헤더로 들어가는데,
대시보드에 긴 키를 붙여넣다 줄이 접히면 이렇게 됩니다. 앱이 화면을 띄우는 동안에는 요청이 없어서
첫 업로드에서야 드러납니다. 값 앞뒤의 공백이나 개행은 명세상 잘려나가므로 원인이 아닙니다.

고친 뒤 **반드시 재배포하세요.** `VITE_` 값은 빌드 시점에 번들에 박히므로 환경변수만 고치면
이미 배포된 빌드는 그대로입니다.

### 앱에서 새로고침하면 404 (Supabase 아님)

`mobile-web`은 브라우저에서 라우팅하는 SPA라 `/compose` 같은 경로에 해당하는 파일이 서버에 없습니다.
[`apps/mobile-web/vercel.json`](../apps/mobile-web/vercel.json)의 rewrite가 이를 처리합니다.
Vercel 프로젝트의 Root Directory가 `apps/mobile-web`이어야 이 파일이 읽힙니다.

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
