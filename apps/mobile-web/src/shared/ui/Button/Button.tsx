import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

const Button = ({ className, children, ...props }: ButtonProps) => {
  return (
    <button className={[styles.button, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </button>
  )
}

export default Button
