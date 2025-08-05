import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        GCX
      </Link>
      <nav className={styles.nav}>
        <Link href="/about">/about</Link>
        <Link href="/events">/events</Link>
        <Link href="/projects">/projects</Link>
        <Link href="/join" className={styles.joinButton}>
          Join Us
        </Link>
      </nav>
    </header>
  );
};

export default Header;
