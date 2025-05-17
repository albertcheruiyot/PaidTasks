// src/components/layout/Header.js - Updated version

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppLogo from '../common/AppLogo'; // Import the AppLogo component
import ConfirmationDialog from './ConfirmationDialog';

import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Add state for confirmation dialog
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  
  const handleLogoutClick = () => {
    // Show confirmation dialog instead of logging out immediately
    setShowLogoutConfirmation(true);
    
    // Close mobile menu if open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };
  
  const handleConfirmLogout = async () => {
    try {
      // Close confirmation dialog
      setShowLogoutConfirmation(false);
      
      // Proceed with logout
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const handleCancelLogout = () => {
    // Close confirmation dialog without logging out
    setShowLogoutConfirmation(false);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Check if the current path matches a nav item
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <header className="header">
      <div className="container">
        <div className="header-container">
          {/* Replace the old logo with the AppLogo component */}
          <AppLogo size="medium" />
          
          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {currentUser ? (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/tasks/videos" className={`nav-link ${isActive('/tasks/videos') ? 'active' : ''}`}>
                  Video Tasks
                </Link>
                <Link to="/tasks/surveys" className={`nav-link ${isActive('/tasks/surveys') ? 'active' : ''}`}>
                  Survey Tasks
                </Link>
                <Link to="/referrals" className={`nav-link ${isActive('/referrals') ? 'active' : ''}`}>
                  Referrals
                </Link>
                <Link to="/wallet" className={`nav-link ${isActive('/wallet') ? 'active' : ''}`}>
                  Wallet
                </Link>
                <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                  Profile
                </Link>
                <button onClick={handleLogoutClick} className="btn btn-outline">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
          
          {/* Mobile menu button */}
          <button className="mobile-menu-button" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {currentUser ? (
            <>
              <Link 
                to="/dashboard" 
                className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/tasks/videos" 
                className={`mobile-nav-link ${isActive('/tasks/videos') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Video Tasks
              </Link>
              <Link 
                to="/tasks/surveys" 
                className={`mobile-nav-link ${isActive('/tasks/surveys') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Survey Tasks
              </Link>
              <Link 
                to="/referrals" 
                className={`mobile-nav-link ${isActive('/referrals') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Referrals
              </Link>
              <Link 
                to="/wallet" 
                className={`mobile-nav-link ${isActive('/wallet') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Wallet
              </Link>
              <Link 
                to="/profile" 
                className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button 
                onClick={handleLogoutClick}
                className="btn btn-outline w-full mt-4"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`mobile-nav-link ${isActive('/login') ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary w-full mt-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
      
      {/* Logout Confirmation Dialog */}
      {showLogoutConfirmation && (
        <ConfirmationDialog
          message="Are you sure you want to log out?"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
    </header>
  );
};

export default Header;