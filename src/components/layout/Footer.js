// src/components/layout/Footer.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, you would handle the newsletter subscription here
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };
  
  return (
    <footer className="footer">
      {/* Wave decoration at the top */}
      <div className="footer-wave"></div>
      
      {/* Decorative floating coins */}
      <div className="footer-coin footer-coin-1">💰</div>
      <div className="footer-coin footer-coin-2">💸</div>
      <div className="footer-coin footer-coin-3">💵</div>
      
      <div className="footer-content">
        <div className="footer-section">
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
        
        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <div className="footer-links">
            <Link to="/dashboard" className="footer-link">Dashboard</Link>
            <Link to="/tasks/videos" className="footer-link">Video Tasks</Link>
            <Link to="/tasks/surveys" className="footer-link">Survey Tasks</Link>
            <Link to="/referrals" className="footer-link">Referral Program</Link>
            <Link to="/wallet" className="footer-link">Wallet & Payments</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Help & Support</h4>
          <div className="footer-links">
            <Link to="/faq" className="footer-link">FAQ</Link>
            <Link to="/contact" className="footer-link">Contact Us</Link>
            <Link to="/help" className="footer-link">Help Center</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h4 className="footer-heading">Stay Updated</h4>
          <p className="footer-text">
            Subscribe to our newsletter for the latest tasks and highest paying opportunities.
          </p>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input 
              type="email" 
              className="newsletter-input" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
          
          <h4 className="footer-heading" style={{ marginTop: '2rem' }}>Get the App</h4>
          <div className="app-badges">
            <Link to="/register" className="app-badge">
              <span className="app-badge-icon">📱</span>
              <span>
                <small>Available on</small><br />
                <strong>iOS & Android</strong>
              </span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bottom-bar">
        <p className="copyright">
          &copy; {new Date().getFullYear()} PaidTasks. All rights reserved.
        </p>
        
        <div className="footer-bottom-links">
          <a href="#" className="footer-bottom-link">Privacy</a>
          <a href="#" className="footer-bottom-link">Terms</a>
          <a href="#" className="footer-bottom-link">Cookies</a>
          <a href="#" className="footer-bottom-link">Security</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;