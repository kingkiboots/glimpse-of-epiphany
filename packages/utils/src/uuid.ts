/**
 * crypto.randomUUID()는 보안 컨텍스트(https 또는 localhost)에서만 쓸 수 있다.
 * 폰에서 http로 LAN 접속해 테스트할 때(`dev:host`) 이 함수가 아예 없으므로,
 * 비보안 컨텍스트에서도 동작하는 crypto.getRandomValues로 대체한다.
 */
export const randomUuid = (): string => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // RFC 4122 version 4 / variant 10xx
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join("-");
};
