import styles from './ProposeProjectVectors.module.css';

const ProposeProjectVectors = () => {
  return (
    <div className={styles.vectorContainer}>
      <div className={`${styles.shape} ${styles.shape1}`}></div>
      <div className={`${styles.shape} ${styles.shape2}`}></div>
      <div className={`${styles.shape} ${styles.shape3}`}></div>
      <svg width="0" height="0">
        <defs>
          <clipPath id="clipPath1" clipPathUnits="objectBoundingBox">
            <path d="M0.999,0.998 C0.999,0.998,0.429,1,0.429,1 C-0.001,1,-0.001,0.002,0.429,0.002 C0.859,0.002,0.999,0,0.999,0 C0.999,0,0.999,0.998,0.999,0.998"></path>
          </clipPath>
          <clipPath id="clipPath2" clipPathUnits="objectBoundingBox">
            <path d="M0,0.998 C0,0.998,0.57,1,0.57,1 C1,1,1,0.002,0.57,0.002 C0.14,0.002,0,0,0,0 C0,0,0,0.998,0,0.998"></path>
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

export default ProposeProjectVectors;
