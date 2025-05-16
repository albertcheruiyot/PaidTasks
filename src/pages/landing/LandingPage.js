// src/pages/landing/LandingPage.js

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqItems = [
    {
      question: "How much money can I earn with PaidTasks?",
      answer: "Your earnings depend on how many tasks you complete. Most users earn between KSh 500 - KSh 2,000 per week by completing available tasks regularly. Top earners who also utilize the referral program can earn KSh 5,000+ weekly."
    },
    {
      question: "How and when do I get paid?",
      answer: "Payments are processed through M-Pesa. You can request a withdrawal from your wallet anytime once you've reached the minimum withdrawal amount. Withdrawals are typically processed within 24 hours."
    },
    {
      question: "What types of tasks will I be completing?",
      answer: "PaidTasks offers various task types including watching short videos, completing surveys, and participating in market research. All tasks are simple and can be completed quickly from your smartphone or computer."
    },
    {
      question: "Is PaidTasks really free to join?",
      answer: "Yes, PaidTasks is completely free to join. We never charge any fees to create an account or complete tasks. We make our money from advertisers and market research companies who want access to our user base. We only ask user to activate their freelance account by paying Ksh.250"
    },
    {
      question: "How does the referral program work?",
      answer: "When you invite friends using your unique referral link, you'll earn KSh 200 for each person who joins and activates their account (completes their first task). There's no limit to how many friends you can refer!"
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">💸 Turn Your Spare Time into Real Money</h1>
          <p className="hero-subtitle">Complete simple tasks, watch videos, and refer friends to earn cash instantly</p>
          
          <div className="hero-earnings">
            <div className="earnings-card">
              <div className="earnings-icon">📝</div>
              <div className="earnings-amount">KSh 50</div>
              <div className="earnings-label">Per Survey</div>
            </div>
            <div className="earnings-card">
              <div className="earnings-icon">🎥</div>
              <div className="earnings-amount">KSh 20</div>
              <div className="earnings-label">Per Video</div>
            </div>
            <div className="earnings-card">
              <div className="earnings-icon">👥</div>
              <div className="earnings-amount">KSh 200</div>
              <div className="earnings-label">Per Referral</div>
            </div>
          </div>

          <div className="cta-buttons">
            <Link to="/register" className="btn-hero-primary">Start Earning Now</Link>
            <Link to="/login" className="btn-hero-secondary">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <div className="stat-value">10,000+</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">💰</div>
              <div className="stat-value">5M+</div>
              <div className="stat-label">KSh Paid Out</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📱</div>
              <div className="stat-value">50K+</div>
              <div className="stat-label">Downloads</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-value">4.8</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose PaidTasks?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Real Money, Real Fast</h3>
              <p className="feature-description">Earn actual cash, not points or tokens. Withdraw directly to M-Pesa with minimum amount of just KSh 50.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3 className="feature-title">Quick & Simple Tasks</h3>
              <p className="feature-description">All tasks are designed to be completed in minutes. No special skills required - just your opinions and attention.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3 className="feature-title">Secure Payments</h3>
              <p className="feature-description">Your earnings are safe with us. Fast and secure payment processing directly to your mobile money account.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Lucrative Referrals</h3>
              <p className="feature-description">Earn KSh 200 for each friend you refer. No limits on how many friends you can invite!</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3 className="feature-title">Work Anywhere</h3>
              <p className="feature-description">Complete tasks from anywhere on any device. Our app works perfectly on both smartphones and computers.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3 className="feature-title">Daily Bonuses</h3>
              <p className="feature-description">Log in daily to receive bonus tasks and special earning opportunities that boost your income.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3 className="step-title">Create a Free Account</h3>
                <p className="step-description">Sign up in seconds with your email or Google account. No hidden fees or subscriptions - completely free to join.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3 className="step-title">Complete Available Tasks</h3>
                <p className="step-description">Browse and complete available tasks including watching videos, taking surveys, or participating in market research.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3 className="step-title">Earn Rewards Instantly</h3>
                <p className="step-description">Get paid immediately after completing verified tasks. Watch your balance grow in real-time on your dashboard.</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3 className="step-title">Cash Out Anytime</h3>
                <p className="step-description">Withdraw your earnings to M-Pesa whenever you want. Minimum withdrawal is just KSh 50, and payments are processed within 24 hours.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-container">
            <div className="testimonial">
              <p className="testimonial-text">I've been using PaidTasks for 3 months now and have earned over KSh 15,000! The tasks are super easy and I love how fast the withdrawals are processed.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">JM</div>
                <div>
                  <p className="testimonial-name">John Mwangi</p>
                  <p className="testimonial-earned">Earned: KSh 15,240</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial">
              <p className="testimonial-text">As a student, PaidTasks has been a lifesaver. I complete tasks between classes and have been able to pay for my daily expenses without asking my parents for money.</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">SW</div>
                <div>
                  <p className="testimonial-name">Sarah Wanjiku</p>
                  <p className="testimonial-earned">Earned: KSh 8,750</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial">
              <p className="testimonial-text">The referral program is incredible! I invited my WhatsApp groups and earned KSh 20,000 in just two weeks. This is definitely not a scam - they pay promptly!</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">DO</div>
                <div>
                  <p className="testimonial-name">David Omondi</p>
                  <p className="testimonial-earned">Earned: KSh 32,600</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-container">
            {faqItems.map((item, index) => (
              <div className="faq-item" key={index}>
                <div 
                  className="faq-question" 
                  onClick={() => toggleQuestion(index)}
                >
                  {item.question}
                  <span className={`faq-toggle ${activeQuestion === index ? 'open' : ''}`}>+</span>
                </div>
                <div className={`faq-answer ${activeQuestion === index ? 'open' : ''}`}>
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Download/App Section */}
      <section className="download-section">
        <div className="container">
          <h2 className="section-title">Get the PaidTasks App</h2>
          <div className="download-content">
            <p>Install our web app on your phone for a better experience. Access tasks faster and get notified about new earning opportunities.</p>
            
            <div className="app-preview">
              <img src="https://via.placeholder.com/300x600" alt="PaidTasks App Preview" />
            </div>
            
            <div className="app-buttons">
              <Link to="/register" className="app-btn">
                <div className="app-btn-icon">📱</div>
                <div className="app-btn-text">
                  <span className="app-btn-label">Install on</span>
                  <span className="app-btn-title">iPhone or Android</span>
                </div>
              </Link>
            </div>
            
            <p className="mt-4">* Simply register and use "Add to Home Screen" feature in your browser</p>
          </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="floating-coins coin-1">💰</div>
        <div className="floating-coins coin-2">💰</div>
        <div className="floating-coins coin-3">💰</div>
        <div className="floating-coins coin-4">💰</div>
        <div className="floating-coins coin-5">💰</div>
        
        <div className="cta-content">
          <h2 className="cta-title">Start Earning Today</h2>
          <p className="cta-text">Join thousands of users who are already making money with PaidTasks. Sign up takes less than 1 minute!</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-hero-primary">Create Free Account</Link>
            <Link to="/login" className="btn-hero-secondary">Sign In</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;