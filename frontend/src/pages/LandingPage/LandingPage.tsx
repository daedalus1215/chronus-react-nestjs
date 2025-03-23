import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { Logo } from '../../components/Logo/Logo';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logoSection}>
          <Logo height={350} />
        </div>

        <div className={styles.actionSection}>
          <h1 className={styles.title}>Chronus</h1>
          <h2 className={styles.subtitle}>Join today</h2>
          
          <div className={styles.buttonGroup}>
            <button 
              onClick={() => navigate('/register')}
              className={styles.createAccountButton}
            >
              Create account
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <div className={styles.signInSection}>
              <p>Already have an account?</p>
              <Link to="/login" className={styles.signInButton}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}; 