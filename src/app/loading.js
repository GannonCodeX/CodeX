// app/loading.js
import LoadingAnimation from './components/LoadingAnimation';
import styles from './loading.module.css';

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <main className={styles.wrapper}>
      <LoadingAnimation />
    </main>
  );
}
