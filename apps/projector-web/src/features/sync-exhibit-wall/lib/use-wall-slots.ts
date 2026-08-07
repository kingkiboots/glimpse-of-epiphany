import { useEffect, useState } from "react";
import { fetchExhibits, subscribeToExhibits } from "@packages/api";
import {
  INITIAL_FETCH_LIMIT,
  clearExhibit,
  placeExhibit,
  resizeSlots,
  type WallSlot,
} from "../model/wall-slot";

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
        setSlots((prev) => clearExhibit(prev, id));
      },
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { slots };
};
