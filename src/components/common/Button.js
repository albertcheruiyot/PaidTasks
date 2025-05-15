// src/components/common/Button.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';
import Loader from './Loader';

/**
 * Button component that can be used as a button or a link
 * @param {Object} props
 * @param {String} props.variant - Button variant ('primary', 'secondary', 'outline', 'text')
 * @param {String} props.size - Button size ('small', 'medium', 'large')
 * @param {String} props.to - If specified, button will be rendered as a Link
 * @param {Boolean} props.fullWidth - Whether button should take full width
 * @param {Boolean} props.loading - Whether button should show loading state
 * @param {String} props.loadingText - Text to show when loading
 * @param {Function} props.onClick - Click handler
 * @param {Boolean} props.disabled - Whether button is disabled
 * @param {String} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 */
const Button = ({ 
  variant = 'primary',
  size = 'medium',
  to,
  fullWidth = false,
  loading = false,
  loadingText,
  onClick,
  disabled = false,
  className = '',
  children,
  ...rest
}) => {
  const buttonClasses = `
    button 
    button-${variant} 
    button-${size}
    ${fullWidth ? 'button-full-width' : ''}
    ${loading ? 'button-loading' : ''} 
    ${disabled ? 'button-disabled' : ''}
    ${className}
  `;
  
  // If the button is loading, show the loader and loading text
  const buttonContent = loading ? (
    <>
      <span className="button-loader">
        <Loader size="small" color={variant === 'primary' ? 'white' : 'primary'} text="" />
      </span>
      {loadingText || children}
    </>
  ) : children;
  
  // If "to" prop is provided, render as a Link
  if (to) {
    return (
      <Link 
        to={to} 
        className={buttonClasses} 
        {...rest}
      >
        {buttonContent}
      </Link>
    );
  }
  
  // Otherwise render as a button
  return (
    <button 
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...rest}
    >
      {buttonContent}
    </button>
  );
};

export default Button;