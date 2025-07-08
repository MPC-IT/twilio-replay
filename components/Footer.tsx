import styles from '@/styles/Footer.module.css';
 
export default function Footer() {
  const year = new Date().getFullYear();
 
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <span>© {year} Multi-Point Communications – All rights reserved</span>
        <a
          href="mailto:acctsrv@multipointcom.com"
          className={styles.footerLink}
        >
          Contact
        </a>
      </div>
    </footer>
  );
}