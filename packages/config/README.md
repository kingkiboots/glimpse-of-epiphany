# @packages/config

> 세 앱과 패키지가 공유하는 ESLint / TypeScript 설정

## 역할

앱마다 린트 규칙과 컴파일러 옵션이 갈리면, 한쪽에서 통과한 코드가 다른 쪽에서 막힙니다.
**설정을 한 곳에 두고 각자 확장하는 방식**으로 그것을 막습니다.

**하지 않는 일**

- 런타임 코드를 제공하지 않습니다. 빌드 타임 설정 전용입니다
- Vite 설정은 공유하지 않습니다. 앱마다 `envDir`, `alias`, 플러그인이 달라
  각 앱의 `vite.config.ts`에서 직접 관리합니다

## 공개 API

`package.json`의 `exports`로 노출합니다.

| 진입점 | 내용 |
| --- | --- |
| `@packages/config/eslint` | ESLint flat config (TypeScript + React Hooks + React Refresh) |
| `@packages/config/typescript/app.json` | 브라우저용 tsconfig (DOM, JSX, bundler resolution) |
| `@packages/config/typescript/node.json` | Node용 tsconfig (`vite.config.ts` 등) |

## 사용 예

```js
// apps/admin-web/eslint.config.js
import { defineConfig } from "eslint/config";
import sharedConfig from "@packages/config/eslint";

export default defineConfig([...sharedConfig]);
```

```jsonc
// apps/admin-web/tsconfig.app.json
{
  "extends": "@packages/config/typescript/app.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

앱이 필요한 것만 덧붙입니다. `mobile-web`은 Storybook 플러그인을,
각 앱은 자기 경로 alias를 추가합니다.

## 설계 노트

**규칙을 직접 정하지 않고 권장 설정을 그대로 씁니다.** `@eslint/js`,
`typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`의
recommended를 조합할 뿐 개별 규칙을 켜고 끄지 않습니다. 규칙 목록을 손으로 관리하기
시작하면 근거를 잊은 채 남는 항목이 생깁니다.

그래서 `react-hooks`의 일부 규칙(예: effect 안에서 상태를 바꾸는 것)이 **경고가 아니라
에러로 빌드를 막는데**, 이는 플러그인의 권장값이지 이 프로젝트가 강화한 것이 아닙니다.
화면이 깜빡이거나 무한 루프로 나타나 원인을 찾기 어려운 종류의 버그라 막아주는 편이 낫습니다.

**`noUnusedLocals` / `noUnusedParameters`를 켰습니다.** 리팩터링 후 남은 잔해가
빌드에서 드러납니다.

**앱이 덧붙이는 옵션도 있습니다.** `erasableSyntaxOnly`(타입만 지우면 JavaScript가
되도록 `enum` 등을 금지)나 `target` 상향은 각 앱의 `tsconfig.app.json`에 있습니다.
공유 설정은 최소 공통분모만 담습니다.

## 의존 관계

의존하는 패키지가 없습니다. 모든 앱과 패키지가 이곳을 devDependency로 참조합니다.
