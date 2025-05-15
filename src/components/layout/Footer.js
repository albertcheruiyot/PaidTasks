// src/components/layout/Footer.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import PwaInstallModal from './PwaInstallModal'; // We'll create this component

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  return (
    <footer className="footer">
      {/* Wave decoration at the top */}
      <div className="footer-wave"></div>
      
      {/* Decorative floating coins */}
      <div className="footer-coin footer-coin-1">💰</div>
      <div className="footer-coin footer-coin-2">💸</div>
      <div className="footer-coin footer-coin-3">💵</div>
      
      <div className="footer-content">
        <div className="footer-primary">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-icon">💸</span>
            PaidTasks
          </Link>
          <p className="footer-text">
            PaidTasks is your gateway to earning real money through simple online tasks. 
            Complete surveys, watch videos, and refer friends to boost your income in your spare time.
          </p>
          
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="social-link" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" className="social-link" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" className="social-link" aria-label="LinkedIn">
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>
        
        <div className="footer-secondary">
          <div className="footer-nav">
            <h4 className="footer-heading">Quick Links</h4>
            <div className="footer-links">
              <Link to="/dashboard" className="footer-link">Dashboard</Link>
              <Link to="/tasks/videos" className="footer-link">Video Tasks</Link>
              <Link to="/tasks/surveys" className="footer-link">Survey Tasks</Link>
              <Link to="/referrals" className="footer-link">Referral Program</Link>
              <Link to="/wallet" className="footer-link">Wallet & Payments</Link>
            </div>
          </div>
          
          <div className="footer-app">
            <h4 className="footer-heading">Get the App</h4>
            <div className="app-badges">
              {/* Changed to button instead of Link to open instructions modal */}
              <button 
                className="app-badge" 
                onClick={() => setShowInstallModal(true)}
                aria-label="Install PaidTasks app"
              >
                <span className="app-badge-icon">📱</span>
                <span className="app-badge-text">
                  <small>Available as</small>
                  <strong>PWA on iOS & Android</strong>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bottom-bar">
        <p className="copyright">
          &copy; {currentYear} PaidTasks. All rights reserved.
        </p>
        
        <div className="footer-bottom-links">
          <a href="#" className="footer-bottom-link">Privacy</a>
          <a href="#" className="footer-bottom-link">Terms</a>
          <a href="#" className="footer-bottom-link">Contact</a>
          <a href="#" className="footer-bottom-link">Help</a>
        </div>
      </div>
      
      {/* PWA Installation Modal */}
      {showInstallModal && (
        <PwaInstallModal onClose={() => setShowInstallModal(false)} />
      )}
    </footer>
  );
};

export default Footer;