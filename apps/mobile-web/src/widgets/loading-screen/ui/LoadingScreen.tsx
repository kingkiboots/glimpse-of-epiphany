import Spinner from '@/shared/ui/Spinner'
import styles from './LoadingScreen.module.css'

type LoadingScreenProps = {
  title: string
  verseReference: string
  verseText: string
  backgroundImageUrl?: string
}

const LoadingScreen = ({ title, verseReference, verseText, backgroundImageUrl }: LoadingScreenProps) => {
  return (
    <div
      className={styles.screen}
      style={backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : undefined}
    >
      <div className={styles.overlay} />
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <div className={styles.loading}>
          <Spinner size={48} />
          <span className={styles.loadingLabel}>Loading...</span>
        </div>
        <div className={styles.verse}>
          <p className={styles.verseReference}>{verseReference}</p>
          <p className={styles.verseText}>{verseText}</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
