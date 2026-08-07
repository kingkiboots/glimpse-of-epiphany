import { useEffect, useState } from "react";
import {
  fetchExhibits,
  subscribeToExhibits,
  type Exhibit,
} from "@packages/api";

/** 칸 하나. 비어 있으면 null이고 화면에는 검은 배경만 남는다. */
export type WallSlot = { exhibit: Exhibit; seq: number } | null;

/** 새로고침 직후 벽을 채울 장수. 칸 수 상한(72)보다 넉넉하면 된다. */
const INITIAL_FETCH_LIMIT = 100;

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
const placeExhibit = (slots: WallSlot[], exhibit: Exhibit): WallSlot[] => {
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

const resizeSlots = (slots: WallSlot[], slotCount: number): WallSlot[] => {
  if (slots.length > slotCount) {
    return slots.slice(0, slotCount);
  }

  return [
    ...slots,
    ...Array.from({ length: slotCount - slots.length }, (): WallSlot => null),
  ];
};

/** 첫 렌더 채우기 + Realtime INSERT/DELETE 반영. 벽 상태의 유일한 관리자다. */
export const useWallSlots = (slotCount: number) => {
  const [slots, setSlots] = useState<WallSlot[]>(() =>
    Array.from({ length: slotCount }, (): WallSlot => null),
  );

  // 설정에서 칸 수가 바뀌면 길이만 맞춘다. 줄이면 아래쪽 칸의 사진이 사라지는데,
  // 운영자가 직접 만지는 값이라 그대로 둔다. (렌더 중 조건부 조정 — React 공식 패턴)
  if (slots.length !== slotCount) {
    setSlots(resizeSlots(slots, slotCount));
  }

  useEffect(() => {
    let active = true;

    // 최신순으로 오므로 뒤집어서 오래된 것부터 위 칸에 깐다.
    void fetchExhibits(INITIAL_FETCH_LIMIT)
      .then((data) => {
        if (!active) {
          return;
        }

        setSlots((prev) => {
          let next = prev;

          for (const exhibit of data.slice(0, prev.length).reverse()) {
            next = placeExhibit(next, exhibit);
          }

          return next;
        });
      })
      .catch((cause: unknown) => {
        // 스크린에 오류 문구를 띄우는 것보다 검은 화면이 낫다. 콘솔에만 남긴다.
        console.error("전시 목록을 불러오지 못했습니다", cause);
      });

    const unsubscribe = subscribeToExhibits({
      onInsert: (exhibit) => {
        setSlots((prev) => placeExhibit(prev, exhibit));
      },
      onDelete: (id) => {
        // 관리자 삭제 또는 2시간 만료. 자리는 메우지 않고 비워 둔다 —
        // 당기면 자리가 전부 밀려 다음 사진의 순번 계산까지 흔들린다.
        setSlots((prev) =>
          prev.some((slot) => slot?.exhibit.id === id)
            ? prev.map((slot) => (slot?.exhibit.id === id ? null : slot))
            : prev,
        );
      },
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { slots };
};
