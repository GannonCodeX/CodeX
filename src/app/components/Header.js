import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <Image
          src="/assets/images/X_.svg" // Using the new SVG
          alt="Gannon CodeX Logo"
          fill // Use fill to allow the parent container to control the size
          style={{ objectFit: 'contain' }} // Ensures the aspect ratio is maintained
          priority
        />
      </Link>
      <nav className={styles.nav}>
        <Link href="/about">/about</Link>
        <Link href="/events">/events</Link>
        <Link href="/projects">/projects</Link>
        <Link href="/gallery">/gallery</Link>
        <a
          href="https://engageu.gannon.edu/organization/guprogramming"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.joinButton}
        >
          Join Us
        </a>
      </nav>
    </header>
  );
};

export default Header;
