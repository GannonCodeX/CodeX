import React from 'react';
import styles from './Highlight.module.css';

const ScribbleCircle = ({ color, ...props }) => (
  <svg
    {...props}
    viewBox="0 0 110 40"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M6.3,10.8C20.1,2.6,79.4,0.4,99.5,11.1c13.4,7.1,5.3,23.6-12.1,26.3C65.2,40.5,12.5,35.4,3.1,20.1C-4.3,8.1,12.5,5.8,21.9,6.6"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Underline = ({ color, ...props }) => (
  <svg
    {...props}
    viewBox="0 0 110 10"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      d="M2.5 5.5C20.5 7.5 78.5 7.5 107.5 2.5"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const Highlight = ({ children, type = 'circle', color = 'var(--accent)' }) => {
  const isCircle = type === 'circle';
  const SvgComponent = isCircle ? ScribbleCircle : Underline;
  const wrapperClass = isCircle ? styles.circleWrapper : styles.underlineWrapper;

  return (
    <span className={styles.highlightContainer}>
      {children}
      <span className={wrapperClass}>
        <SvgComponent color={color} className={styles.svg} />
      </span>
    </span>
  );
};

export default Highlight;