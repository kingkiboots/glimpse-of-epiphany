import { EXHIBIT_TTL_MINUTES } from "@packages/api";
import { useExhibits } from "@/features/manage-exhibits";
import styles from "./ExhibitsPage.module.css";

type ExhibitsPageProps = {
  onSignOut: () => void;
};

const formatTime = (isoString: string) =>
  new Date(isoString).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const ExhibitsPage = ({ onSignOut }: ExhibitsPageProps) => {
  const { exhibits, isLoading, error, deletingIds, remove } = useExhibits();

  const handleDeleteClick = (id: string) => {
    // 하드킬이라 되돌릴 수 없다. 한 번 더 묻는다.
    if (!window.confirm("이 사진을 삭제할까요? 되돌릴 수 없습니다.")) {
      return;
    }

    void remove(id);
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>전시물 관리</h1>
          <p className={styles.caption}>
            {EXHIBIT_TTL_MINUTES}분이 지나면 자동으로 사라집니다. 목록은 실시간으로
            갱신됩니다.
          </p>
        </div>
        <button className={styles.signOut} type="button" onClick={onSignOut}>
          로그아웃
        </button>
      </header>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {isLoading ? <p className={styles.empty}>불러오는 중...</p> : null}

      {!isLoading && exhibits.length === 0 ? (
        <p className={styles.empty}>지금 전시 중인 사진이 없습니다.</p>
      ) : null}

      <ul className={styles.grid}>
        {exhibits.map((exhibit) => {
          const isDeleting = deletingIds.has(exhibit.id);

          return (
            <li className={styles.card} key={exhibit.id}>
              <img
                className={styles.image}
                src={exhibit.imageUrl}
                alt={exhibit.message || "전시된 사진"}
                loading="lazy"
              />
              <div className={styles.body}>
                <p className={styles.message}>{exhibit.message || "(메시지 없음)"}</p>
                <p className={styles.time}>{formatTime(exhibit.createdAt)}</p>
              </div>
              <button
                className={styles.delete}
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteClick(exhibit.id)}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ExhibitsPage;
