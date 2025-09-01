// src/app/not-found.js
import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.subtitle}>Page Not Found</p>
        <p className={styles.description}>
          Sorry, the page you are looking for does not exist.
        </p>
        <Link href="/" className={styles.homeButton}>
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
