import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
} from "react";
import styles from "./ImageBox.module.css";

type ImageBoxProps = {
  file: File | null;
  onChange: (file: File | null) => void;
  placeholder?: string;
};

const ImageBox = ({
  file,
  onChange,
  placeholder = "사진 선택하기",
}: ImageBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      onChange(event.target.files?.[0] ?? null);
    },
    [onChange],
  );

  return (
    <button
      type="button"
      className={styles.root}
      onClick={() => inputRef.current?.click()}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="선택한 사진 미리보기"
          className={styles.preview}
        />
      ) : (
        <span className={styles.placeholder}>
          <span className={styles.placeholderLabel}>{placeholder}</span>
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.input}
        onChange={handleChange}
      />
    </button>
  );
};

export default ImageBox;
