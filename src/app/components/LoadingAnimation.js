// app/components/LoadingAnimation.js
import React from 'react';
import styles from './LoadingAnimation.module.css';

const LoadingAnimation = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.logo}>
        <span className={`${styles.char} ${styles.g}`}>G</span>
        <span className={`${styles.char} ${styles.c}`}>C</span>
        <span className={`${styles.char} ${styles.x}`}>X</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progress}></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;