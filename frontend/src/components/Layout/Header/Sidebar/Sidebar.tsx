import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';
import logo from '/public/chronus1.svg'

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <Link to="/" className={styles.brand}>
            <img src={logo} alt="Chronus Logo" className={styles.logo} />
            <span className={styles.name}>Chronus</span>
          </Link>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <nav className={styles.nav}>
          <Link to="/" className={styles.navItem}>
            <span className={styles.navText}>Home</span>
          </Link>
          <Link to="/notes" className={styles.navItem}>
            <span className={styles.navText}>Notes</span>
          </Link>
          <Link to="/memos" className={styles.navItem}>
            <span className={styles.navText}>Memos</span>
          </Link>
        </nav>
      </aside>
    </>
  );
} 