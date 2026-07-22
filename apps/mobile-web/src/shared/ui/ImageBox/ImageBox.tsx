import { useEffect, useMemo, useRef, type ChangeEventHandler } from 'react'
import styles from './ImageBox.module.css'

type ImageBoxProps = {
  file: File | null
  onChange: (file: File | null) => void
  className?: string
  placeholder?: string
}

const ImageBox = ({ file, onChange, className, placeholder = '사진 선택하기' }: ImageBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onChange(event.target.files?.[0] ?? null)
  }

  return (
    <button
      type="button"
      className={[styles.box, className].filter(Boolean).join(' ')}
      onClick={() => inputRef.current?.click()}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="선택한 사진 미리보기" className={styles.preview} />
      ) : (
        <span className={styles.placeholder}>{placeholder}</span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.input}
        onChange={handleChange}
      />
    </button>
  )
}

export default ImageBox
