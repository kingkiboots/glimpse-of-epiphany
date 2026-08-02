/**
 * Supabase URL과 anon 키는 모든 요청에서 HTTP 헤더 값으로 쓰인다.
 * (supabase-js가 `headers.set('apikey', ...)`을 호출한다)
 *
 * 그런데 배포 대시보드에 긴 키를 붙여넣다 보면 값 중간에 줄바꿈이 끼어들 때가 있다.
 * 그러면 첫 요청에서 "Failed to execute 'set' on 'Headers': Invalid value"만 던져지는데,
 * 이 메시지만 보고 환경변수 문제라는 걸 알아내기는 매우 어렵다.
 *
 * 값 앞뒤 공백은 Fetch 명세가 알아서 잘라내므로 문제가 되지 않는다.
 * 실제로 터지는 것은 값 "중간"의 줄바꿈·제어문자와 라틴-1 범위를 넘는 문자다.
 *
 * URL과 키 모두 공백을 포함하지 않는 값이므로, 공백류는 조용히 걷어내되
 * 경고를 남기고, 그래도 남는 이상 문자는 원인을 짚어 예외를 던진다.
 */

/** 헤더 값으로 안전한 범위(출력 가능한 ASCII) 밖의 문자 */
const UNSAFE_CHARACTER = /[^\x20-\x7e]/;

const describeCharacter = (value: string): string => {
  const index = value.search(UNSAFE_CHARACTER);
  const codePoint = value.codePointAt(index) ?? 0;

  return `${index}번째 위치에 U+${codePoint.toString(16).toUpperCase().padStart(4, "0")} 문자`;
};

/**
 * 환경변수 값에서 헤더로 쓸 수 없는 문자를 걸러낸다.
 * 되살릴 수 없는 값이면 원인을 설명하는 예외를 던진다.
 */
export const sanitizeEnvValue = (name: string, raw: string): string => {
  // 줄바꿈·탭·공백은 이 값들에 들어갈 이유가 없다. 붙여넣기 사고로 보고 걷어낸다.
  const sanitized = raw.replace(/\s+/g, "");

  if (sanitized !== raw) {
    console.warn(
      `${name} 값에 공백이나 줄바꿈이 섞여 있어 제거했습니다. ` +
        `배포 환경의 환경변수를 한 줄로 다시 입력한 뒤 재배포하세요. ` +
        `(VITE_ 값은 빌드 시점에 번들에 박히므로 환경변수만 고치면 반영되지 않습니다)`,
    );
  }

  if (UNSAFE_CHARACTER.test(sanitized)) {
    throw new Error(
      `${name} 값에 HTTP 헤더로 쓸 수 없는 문자가 있습니다 (${describeCharacter(sanitized)}). ` +
        `Supabase 대시보드에서 값을 다시 복사해 넣어주세요.`,
    );
  }

  if (!sanitized) {
    throw new Error(`${name} 값이 비어 있습니다.`);
  }

  return sanitized;
};
