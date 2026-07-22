# glimpse of epiphany (수련회 실시간 이미지/메시지 공유 플랫폼)

## Project Overview

- 150명의 수련회 참가자가 모바일 기기로 사진과 메시지를 업로드하면, 빔프로젝터(PC)에서 실시간으로 화면에 렌더링(GSAP 슬라이더)하는 무과금/고성능 웹 애플리케이션
- 백엔드(NestJS 등) 없이 클라이언트가 Supabase와 직접 통신(RLS 정책 활용)하는 아키텍처

## Tech Stack

- **Core:** React 19, TypeScript, Vite
- **Styling:** CSS Modules (Tailwind 사용 금지)
- **Animation:** GSAP (`@gsap/react`)
- **BaaS:** Supabase (Auth, Database, Storage, Realtime)
- **Monorepo:** Turborepo, pnpm workspace

## Workspace Structure (pnpm)

- `apps/mobile-web`: 모바일 업로드 전용 SPA (입력 폼 위주)
- `apps/projector-web`: 빔프로젝터 전용 뷰어 SPA (Websocket 기반 실시간 수신 + GSAP 렌더링)
- `packages/config`: ESLint, TSConfig, Vite 공통 설정 공유 패키지
- `packages/api`: Supabase Singleton 클라이언트 및 API 공통 로직
- _참고: 두 앱의 UI 성격이 매우 다르므로 `packages/ui`는 사용하지 않으며, 각 앱의 `shared/ui`에서 개별 관리합니다._
- **Import Alias:** 공유 패키지는 `@packages/*` 로, 앱 내부는 `@/*` 로 import 합니다.

## Architecture Rules (FSD - Feature-Sliced Design)

`apps` 하위의 모든 프론트엔드 코드는 반드시 FSD 방법론을 엄격하게 준수합니다.

1. **app:** 전역 설정, 프로바이더, 라우팅 초기화, 글로벌 스타일
2. **pages:** 라우팅 단위 컴포넌트 조합
3. **widgets:** 여러 feature나 entity가 조합된 독립적인 UI 블록
4. **features:** 사용자의 상호작용(업로드 폼, 뷰어 큐 관리 등)이 일어나는 비즈니스 로직
5. **entities:** 도메인 모델, 타입 정의, Supabase 스키마 인터페이스
6. **shared:** UI 컴포넌트(버튼, 인풋), 유틸 함수, 훅, API 인스턴스

- **Dependency Rule:** 상위 레이어는 하위 레이어를 import 할 수 있지만, 하위 레이어는 절대 상위 레이어를 import 할 수 없습니다. (단방향 의존성)
- **Cross-import Rule:** 동일한 레이어 내부의 다른 슬라이스끼리는 직접 import 할 수 없습니다.

## AI Coding Agent (Claude) Guidelines

### 1. Figma UI / Layout Constraints

- 주어진 Figma 디자인은 **Auto Layout이 적용되지 않은 1차원 평면 구조**일 확률이 높습니다.
- **[절대 금지]:** MCP나 디자인 수치를 기반으로 `position: absolute;`, `top`, `left`, `right` 등의 절대 좌표를 사용한 CSS를 생성하지 마십시오.
- **[권장 사항]:** Flexbox(`display: flex`)와 Grid를 사용하여 반응형 DOM 뼈대를 스스로 유추하여 구성하십시오.
- MCP 도구는 주로 디자인 토큰(Hex 컬러, 폰트 사이즈) 추출, SVG 에셋 추출, 텍스트 문구 추출 용도로만 활용하십시오.

### 2. Backend & Data Fetching

- 커스텀 REST API 서버를 생성하거나 가정하지 마십시오.
- 모든 데이터 통신 및 파일 업로드는 프론트엔드에서 Supabase Client 객체를 통해 다이렉트로 수행합니다.
- 이미지 파일 업로드 전, 클라이언트 측에서 `browser-image-compression`을 활용하여 최대 300KB로 압축하는 로직을 반드시 포함하십시오.

### 3. State Management & Animations

- 전역 상태 관리는 최소화하고, FSD의 `entities`나 `features` 단위의 커스텀 훅으로 캡슐화하십시오.
- 프로젝터 웹의 애니메이션은 반드시 GSAP과 `@gsap/react`의 `useGSAP` 훅을 사용하며, 메모리 누수(Memory Leak) 방지를 위해 화면 밖으로 나간 DOM은 리액트 상태(Queue)에서 즉각 제거(GC)되도록 설계하십시오.

## 💻 CLI Commands

- `pnpm dev`: 모든 앱 로컬 개발 서버 실행
- `pnpm build`: 타입 검사 및 프로덕션 빌드
- `pnpm lint`: ESLint 검사
- `pnpm add -D <package> --filter <workspace>`: 특정 앱/패키지에 의존성 추가
