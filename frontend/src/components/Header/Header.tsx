import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { Sidebar } from './Sidebar/Sidebar';
import { Logo } from '../Logo/Logo';
import { useSidebar } from '../../contexts/SidebarContext';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { logout, user } = useAuth();
  const { isOpen, setIsOpen, isMobile } = useSidebar();
  const navigate = useNavigate();
                                          
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <header className={`${styles.header} ${isMobile ? styles.mobile : ''}`}>
        <div className={styles.container}>
          <button onClick={toggleSidebar} className={styles.brand}>
            <Logo />
            <span className={styles.name}>Chronus</span>
          </button>
          <div className={styles.rightSection}>
            <span className={styles.username}>{user?.username}</span>
            <button 
              onClick={handleSignOut} 
              className={styles.signOutButton}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <Sidebar 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
} 





