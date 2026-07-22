import type { CSSProperties, HTMLAttributes } from 'react'
import styles from './Spinner.module.css'

type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: number
}

const Spinner = ({ size = 48, className, style, ...props }: SpinnerProps) => {
  return (
    <div
      role="status"
      aria-label="로딩 중"
      className={[styles.spinner, className].filter(Boolean).join(' ')}
      style={{ ...style, '--spinner-size': `${size}px` } as CSSProperties}
      {...props}
    />
  )
}

export default Spinner
