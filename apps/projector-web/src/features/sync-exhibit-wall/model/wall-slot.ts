import type { Exhibit } from "@packages/api";

/** 칸 하나. 비어 있으면 null이고 화면에는 검은 배경만 남는다. */
export type WallSlot = { exhibit: Exhibit; seq: number } | null;

/** 새로고침 직후 벽을 채울 장수. 칸 수 상한(72)보다 넉넉하면 된다. */
export const INITIAL_FETCH_LIMIT = 100;

/**
 * 자리 배정 규칙: **빈 칸 중 가장 위, 없으면 가장 오래된 칸.**
 *
 * 이 한 줄이 기획의 세 요구를 전부 만족한다 — 위에서부터 채워지는 것,
 * 19번째 사진이 1번 자리를 다시 꿰차는 것, 운영자 삭제로 생긴 구멍을
 * 다음 업로드가 메우는 것이 전부 여기서 자동으로 나온다.
 *
 * seq는 도착 순서다. "가장 오래된 칸"을 찾는 데만 쓰므로 단조 증가만 보장하면
 * 되고, 기존 칸들의 최댓값 + 1로 구해 상태 갱신 함수를 순수하게 유지한다.
 */
export const placeExhibit = (
  slots: WallSlot[],
  exhibit: Exhibit,
): WallSlot[] => {
  if (
    slots.length === 0 ||
    slots.some((slot) => slot?.exhibit.id === exhibit.id)
  ) {
    return slots;
  }

  const seq = Math.max(0, ...slots.map((slot) => slot?.seq ?? 0)) + 1;
  const next = [...slots];
  const emptyIndex = next.findIndex((slot) => slot === null);

  if (emptyIndex !== -1) {
    next[emptyIndex] = { exhibit, seq };
    return next;
  }

  let oldestIndex = 0;
  let oldestSeq = Infinity;

  next.forEach((slot, index) => {
    if (slot !== null && slot.seq < oldestSeq) {
      oldestSeq = slot.seq;
      oldestIndex = index;
    }
  });

  next[oldestIndex] = { exhibit, seq };
  return next;
};

export const resizeSlots = (
  slots: WallSlot[],
  slotCount: number,
): WallSlot[] => {
  if (slots.length > slotCount) {
    return slots.slice(0, slotCount);
  }

  return [
    ...slots,
    ...Array.from({ length: slotCount - slots.length }, (): WallSlot => null),
  ];
};

/** 삭제된 전시물이 차지하던 칸을 비운다. 자리는 메우지 않는다. */
export const clearExhibit = (slots: WallSlot[], id: string): WallSlot[] => {
  if (!slots.some((slot) => slot?.exhibit.id === id)) {
    return slots;
  }

  return slots.map((slot) => (slot?.exhibit.id === id ? null : slot));
};
