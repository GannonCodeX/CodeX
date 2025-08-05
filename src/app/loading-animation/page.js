// app/loading-animation/page.js
import LoadingAnimation from '../components/LoadingAnimation';
import styles from './loading-animation.module.css';

const LoadingAnimationPage = () => {
  return (
    <main className={styles.wrapper}>
      <LoadingAnimation />
    </main>
  );
};

export default LoadingAnimationPage;
