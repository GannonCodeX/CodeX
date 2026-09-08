'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

const HeaderContent = ({ pathname }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    navRef.current?.querySelector('a')?.focus();
    const onKeyDown = (event) => {
      const firstLink = navRef.current?.querySelector('a');
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      } else if (event.key === 'Tab' && !event.shiftKey && document.activeElement === menuButtonRef.current) {
        event.preventDefault(); firstLink?.focus();
      } else if (event.key === 'Tab' && event.shiftKey && document.activeElement === firstLink) {
        event.preventDefault(); menuButtonRef.current?.focus();
      }
    };
    const onResize = () => { if (window.innerWidth > 1200) setIsMenuOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
        <Image
          src="/assets/images/X_.svg"
          alt="Gannon CodeX Logo"
          fill
          style={{ objectFit: 'contain' }}
          priority
        />
      </Link>
      <nav ref={navRef} id="main-navigation" aria-label="Main navigation" className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
        <Link href="/about" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          /about
        </Link>
        <Link href="/events" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          /events
        </Link>
        <Link href="/projects" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          /projects
        </Link>
        <Link href="/resources" className={styles.navLink} onClick={() => setIsMenuOpen(false)} aria-current={pathname === '/resources' ? 'page' : undefined}>
          /resources
        </Link>
        <Link href="/propose-a-project" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          /propose
        </Link>
        <Link href="/clubs" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          /clubs
        </Link>
        <Link href="/gallery" className={styles.navLink} onClick={() => setIsMenuOpen(false)}>
          /gallery
        </Link>
        <a
          href="https://engageu.gannon.edu/organization/guprogramming"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.joinButton}
          onClick={() => setIsMenuOpen(false)}
        >
          Join Us
        </a>
      </nav>
      <button ref={menuButtonRef} type="button" className={styles.hamburger} onClick={toggleMenu} aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={isMenuOpen} aria-controls="main-navigation">
        {isMenuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>
    </header>
  );
};

const Header = () => {
  const pathname = usePathname();
  return <HeaderContent key={pathname} pathname={pathname} />;
};

export default Header;
