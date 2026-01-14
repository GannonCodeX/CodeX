import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} Gannon Codex
      </div>
      <div className={styles.links}>
        <a href="/clubs">Clubs</a>
        <a href="/projects">Projects</a>
        <a href="/events/calendar">Events</a>
        <a href="/gallery">Gallery</a>
        <a href="/schedule">Schedule</a>
        <a href="/propose-a-project">Propose</a>
        <a href="/partner">Partner</a>
        <a href="https://github.com/gannoncodex" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://discord.gg/3qEnhQYtp3" target="_blank" rel="noopener noreferrer">Discord</a>
      </div>
    </footer>
  );
};

export default Footer;
