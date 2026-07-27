import { cn } from "@packages/utils";
import type { ChangeEventHandler, TextareaHTMLAttributes } from "react";
import styles from "./Input.module.css";

type InputProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  maxLength?: number;
};

const Input = ({
  value,
  onChange,
  maxLength = 100,
  className,
  ...props
}: InputProps) => {
  return (
    <div className={cn(styles.wrapper, className)}>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder="내용을 입력해주세요."
        {...props}
      />
      <span className={styles.counter}>
        {value.length} / {maxLength}
      </span>
    </div>
  );
};

export default Input;
