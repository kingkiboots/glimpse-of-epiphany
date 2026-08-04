import { useCallback, useEffect, useState } from "react";
import {
  deleteExhibit,
  fetchExhibits,
  subscribeToExhibits,
  type Exhibit,
} from "@packages/api";

/**
 * 관리자 목록. 참가자가 올리는 사진이 계속 들어오고, 2시간이 지난 것은 스스로
 * 사라지므로, Realtime으로 붙들어 이미 없어진 사진에 삭제 버튼을 누르는 상황을 막는다.
 */
export const useExhibits = () => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    let active = true;

    void fetchExhibits(200)
      .then((data) => {
        if (active) {
          setExhibits(data);
          setIsLoading(false);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : String(cause));
          setIsLoading(false);
        }
      });

    const unsubscribe = subscribeToExhibits({
      onInsert: (exhibit) => {
        setExhibits((prev) =>
          prev.some((item) => item.id === exhibit.id)
            ? prev
            : [exhibit, ...prev],
        );
      },
      onDelete: (id) => {
        setExhibits((prev) => prev.filter((item) => item.id !== id));
      },
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const remove = useCallback(async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));

    try {
      await deleteExhibit(id);
      // Realtime DELETE도 곧 도착하지만, 누른 즉시 사라지도록 여기서 먼저 지운다.
      setExhibits((prev) => prev.filter((item) => item.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  return { exhibits, isLoading, error, deletingIds, remove };
};
