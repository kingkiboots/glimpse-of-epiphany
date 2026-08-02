import { cn } from "@packages/utils";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEventHandler,
  type FocusEventHandler,
  type TextareaHTMLAttributes,
} from "react";
import styles from "./Input.module.css";

type InputProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  /**
   * 초기값. 마운트 이후에는 내부 state가 화면을 그리므로
   * 밖에서 value를 바꿔도 textarea에 반영되지 않는다.
   * 값을 강제로 갈아끼워야 한다면 key를 바꿔 리마운트시킨다.
   */
  value: string;
  /** 입력이 debounceMs 동안 멈췄을 때, 또는 포커스가 빠질 때 한 번만 호출된다. */
  onChange: (value: string) => void;
  maxLength?: number;
  debounceMs?: number;
};

const Input = ({
  value,
  onChange,
  maxLength = 100,
  debounceMs = 200,
  className,
  onBlur,
  ...props
}: InputProps) => {
  // 글자 수 카운터와 textarea는 내부 state로 즉시 갱신하고,
  // 부모(=Context)에게는 입력이 멈춘 뒤 한 번만 알려 리렌더 횟수를 줄인다.
  const [draft, setDraft] = useState(value);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 아직 부모에게 전달하지 않은 값. 전달할 게 없으면 null. */
  const pendingRef = useRef<string | null>(null);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const pending = pendingRef.current;

    if (pending === null) {
      return;
    }

    pendingRef.current = null;
    onChange(pending);
  }, [onChange]);

  // 언마운트 시점의 최신 flush를 참조하기 위한 우회.
  // flush를 effect 의존성에 직접 넣으면 onChange가 바뀔 때마다 조기 flush된다.
  const flushRef = useRef(flush);

  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  // 마지막 타이핑 후 200ms가 지나기 전에 화면을 벗어나도 입력이 사라지지 않도록 한다.
  useEffect(() => () => flushRef.current(), []);

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    const next = event.target.value;

    setDraft(next);
    pendingRef.current = next;

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(flush, debounceMs);
  };

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = (event) => {
    flush();
    onBlur?.(event);
  };

  return (
    <div className={cn(styles.wrapper, className)}>
      <textarea
        className={styles.textarea}
        value={draft}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={maxLength}
        placeholder="내용을 입력해주세요."
        {...props}
      />
      <span className={styles.counter}>
        {draft.length} / {maxLength}
      </span>
    </div>
  );
};

export default Input;
