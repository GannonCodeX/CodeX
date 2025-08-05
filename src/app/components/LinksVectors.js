import React from 'react';
import styles from './LinksVectors.module.css';

const SVGs = [
  // Circle
  <svg key="1" className={`${styles.vector} ${styles.svg1}`} viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" /></svg>,
  // Plus
  <svg key="2" className={`${styles.vector} ${styles.svg2}`} viewBox="0 0 10 10"><path d="M0 5 H10 M5 0 V10" /></svg>,
  // Triangle
  <svg key="3" className={`${styles.vector} ${styles.svg3}`} viewBox="0 0 10 10"><path d="M5 0 L10 10 L0 10 Z" /></svg>,
  // Zigzag
  <svg key="4" className={`${styles.vector} ${styles.svg4}`} viewBox="0 0 20 10"><path d="M0 5 L5 0 L10 10 L15 0 L20 5" /></svg>,
  // Square
  <svg key="5" className={`${styles.vector} ${styles.svg5}`} viewBox="0 0 10 10"><rect width="8" height="8" x="1" y="1" /></svg>,
  // Brackets
  <svg key="6" className={`${styles.vector} ${styles.svg6}`} viewBox="0 0 10 10"><path d="M0 0 H3 V10 H0 M10 0 H7 V10 H10" /></svg>,
  // X
  <svg key="7" className={`${styles.vector} ${styles.svg7}`} viewBox="0 O 10 10"><path d="M0 0 L10 10 M10 0 L0 10" /></svg>,
  // Half circle
  <svg key="8" className={`${styles.vector} ${styles.svg8}`} viewBox="0 0 10 10"><path d="M0 5 A5 5 0 0 1 10 5" /></svg>,
  // Squiggle
  <svg key="9" className={`${styles.vector} ${styles.svg9}`} viewBox="0 0 20 10"><path d="M0,5 C5,0 15,10 20,5" /></svg>,
  // Diamond
  <svg key="10" className={`${styles.vector} ${styles.svg10}`} viewBox="0 0 10 10"><path d="M5 0 L10 5 L5 10 L0 5 Z" /></svg>,
];

const LinksVectors = () => {
  return <div className={styles.vectorWrapper}>{SVGs}</div>;
};

export default LinksVectors;
