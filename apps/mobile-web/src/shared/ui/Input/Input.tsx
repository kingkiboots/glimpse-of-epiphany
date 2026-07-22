import type { ChangeEventHandler, TextareaHTMLAttributes } from 'react'
import styles from './Input.module.css'

type InputProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
  value: string
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  maxLength?: number
}

const Input = ({ value, onChange, maxLength = 100, className, ...props }: InputProps) => {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        {...props}
      />
      <span className={styles.counter}>
        {value.length} / {maxLength}
      </span>
    </div>
  )
}

export default Input
