import styles from "./ImageBox.module.css";

type ImageBoxProps = {
  /** 표시할 이미지 URL. 없으면 placeholder를 보여준다. */
  src: string | null;
  alt?: string;
  placeholder?: string;
};

/**
 * 고른 사진을 보여주기만 한다. 사진 선택은 홈 화면에서 한 번만 일어나고,
 * 그 직후 준비 화면에서 webp로 변환하기 때문에 이후 화면에서 사진을 바꿀 수 없다.
 */
const ImageBox = ({
  src,
  alt = "선택한 사진",
  placeholder = "선택한 사진이 없어요",
}: ImageBoxProps) => {
  return (
    <div className={styles.root}>
      {src ? (
        <img src={src} alt={alt} className={styles.preview} />
      ) : (
        <span className={styles.placeholder}>
          <span className={styles.placeholderLabel}>{placeholder}</span>
        </span>
      )}
    </div>
  );
};

export default ImageBox;
