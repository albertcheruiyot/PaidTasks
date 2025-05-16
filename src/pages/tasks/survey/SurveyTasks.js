// src/pages/tasks/survey/SurveyTasks.js

import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, increment, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import surveyData from './surveyData';
import './SurveyTasks.css';

const SurveyTasks = () => {
  const { currentUser, userData, refreshUserData, showNotification } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [animateIn, setAnimateIn] = useState(false);
  const [surveyList, setSurveyList] = useState([]);
  
  // State for active survey and question
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [earnedReward, setEarnedReward] = useState(0);

  // Ref for scrolling
  const surveyContainerRef = useRef(null);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        if (userData) {
          // Get completed surveys from userData
          setCompletedSurveys(userData.completedSurveys || []);
          
          // Set survey list from imported data
          setSurveyList(surveyData);
        }
        setLoading(false);
        
        // Trigger animation after a small delay
        setTimeout(() => setAnimateIn(true), 100);
      } catch (err) {
        console.error('Error fetching survey data:', err);
        setError('Failed to load surveys.');
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [userData]);

  const handleStartSurvey = (survey) => {
    // Add animation before setting activeSurvey
    setAnimateIn(false);
    setTimeout(() => {
      // Set the active survey data
      setActiveSurvey(survey);
      setCurrentQuestionIndex(0);
      setAnswers({});
      
      // Scroll the survey container into view in the next render cycle
      setTimeout(() => {
        if (surveyContainerRef.current) {
          surveyContainerRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
        
        // Animate in the survey content
        setAnimateIn(true);
      }, 50);
    }, 300);
  };

  const handleCloseSurvey = () => {
    // Start fade-out animation
    setAnimateIn(false);
    
    // After animation completes, reset survey state
    setTimeout(() => {
      setActiveSurvey(null);
      setCurrentQuestionIndex(0);
      setAnswers({});
      
      // After state is reset, start fade-in animation for survey list
      setTimeout(() => {
        setAnimateIn(true);
        
        // Scroll back to top
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }, 100);
    }, 300);
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    const currentQuestion = activeSurvey.questions[currentQuestionIndex];
    
    // Validate required questions
    if (currentQuestion.required && !answers[currentQuestion.id]) {
      showNotification({
        type: 'error',
        message: 'Please answer this question before proceeding.'
      });
      return;
    }
    
    // Move to next question or submit if last question
    if (currentQuestionIndex < activeSurvey.questions.length - 1) {
      // Animate transition between questions
      const questionElement = document.querySelector('.survey-question');
      questionElement.classList.add('slide-out');
      
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeout(() => {
          if (questionElement) {
            questionElement.classList.remove('slide-out');
            questionElement.classList.add('slide-in');
            
            // Remove animation class after animation completes
            setTimeout(() => {
              if (questionElement) {
                questionElement.classList.remove('slide-in');
              }
            }, 500);
          }
        }, 50);
      }, 300);
    } else {
      handleSubmitSurvey();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Animate transition between questions
      const questionElement = document.querySelector('.survey-question');
      questionElement.classList.add('slide-out-reverse');
      
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setTimeout(() => {
          if (questionElement) {
            questionElement.classList.remove('slide-out-reverse');
            questionElement.classList.add('slide-in-reverse');
            
            // Remove animation class after animation completes
            setTimeout(() => {
              if (questionElement) {
                questionElement.classList.remove('slide-in-reverse');
              }
            }, 500);
          }
        }, 50);
      }, 300);
    }
  };

  const handleSubmitSurvey = async () => {
    try {
      setSubmitting(true);
      
      // Validate all required questions are answered
      const unansweredRequired = activeSurvey.questions.filter(
        q => q.required && !answers[q.id]
      );
      
      if (unansweredRequired.length > 0) {
        showNotification({
          type: 'error',
          message: 'Please answer all required questions.'
        });
        setSubmitting(false);
        return;
      }
      
      // Update Firestore with minimal data
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        // Add only the survey ID to completedSurveys array
        completedSurveys: arrayUnion(activeSurvey.id),
        // Update user's earnings
        availableBalance: increment(activeSurvey.reward),
        totalEarnings: increment(activeSurvey.reward),
        // Increment completed tasks counter
        completedTasks: increment(1),
        // Update lastActive timestamp
        lastActive: serverTimestamp()
      });
      
      // Update local state
      setCompletedSurveys(prev => [...prev, activeSurvey.id]);
      
      // Show success animation
      setEarnedReward(activeSurvey.reward);
      setShowSuccessAnimation(true);
      
      // Refresh user data to reflect new balance
      await refreshUserData();
      
      // Show success notification
      showNotification({
        type: 'success',
        message: `Survey completed! You earned KSh ${activeSurvey.reward}.`
      });
      
      // Reset after animation ends
      setTimeout(() => {
        setShowSuccessAnimation(false);
        // Reset survey state with animation
        setAnimateIn(false);
        setTimeout(() => {
          setActiveSurvey(null);
          setCurrentQuestionIndex(0);
          setAnswers({});
          setTimeout(() => {
            setAnimateIn(true);
            // Scroll back to top of the container when returning to survey list
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }, 100);
        }, 300);
      }, 3500);
      
    } catch (err) {
      console.error('Error submitting survey:', err);
      showNotification({
        type: 'error',
        message: 'Failed to submit survey. Please try again.'
      });
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="survey-question-options">
            {question.options.map((option, index) => (
              <div className="option-item" key={index}>
                <input
                  type="radio"
                  id={`option-${index}`}
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                />
                <label htmlFor={`option-${index}`}>{option}</label>
                <span className="custom-radio"></span>
              </div>
            ))}
          </div>
        );
      
      case 'multiple-select':
        return (
          <div className="survey-question-options">
            {question.options.map((option, index) => {
              const selectedOptions = answers[question.id] || [];
              return (
                <div className="option-item" key={index}>
                  <input
                    type="checkbox"
                    id={`option-${index}`}
                    value={option}
                    checked={selectedOptions.includes(option)}
                    onChange={() => {
                      const currentSelections = answers[question.id] || [];
                      let newSelections;
                      
                      if (currentSelections.includes(option)) {
                        newSelections = currentSelections.filter(item => item !== option);
                      } else {
                        newSelections = [...currentSelections, option];
                      }
                      
                      handleAnswerChange(question.id, newSelections);
                    }}
                  />
                  <label htmlFor={`option-${index}`}>{option}</label>
                  <span className="custom-checkbox"></span>
                </div>
              );
            })}
          </div>
        );
      
      case 'rating':
        return (
          <div className="rating-scale">
            <div className="rating-labels">
              {question.labels.map((label, index) => (
                <div key={index} className="rating-label">{label}</div>
              ))}
            </div>
            <div className="rating-buttons">
              {Array.from({ length: question.scale }, (_, i) => i + 1).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`rating-button ${answers[question.id] === value ? 'selected' : ''}`}
                  onClick={() => handleAnswerChange(question.id, value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'open-ended':
        return (
          <div className="survey-question-text">
            <textarea
              placeholder={question.placeholder || "Type your answer here..."}
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              rows={4}
            />
          </div>
        );
      
      case 'yes-no':
        return (
          <div className="survey-question-yes-no">
            <button
              type="button"
              className={`yes-no-button ${answers[question.id] === true ? 'selected' : ''}`}
              onClick={() => handleAnswerChange(question.id, true)}
            >
              <span className="button-icon">✓</span>
              Yes
            </button>
            <button
              type="button"
              className={`yes-no-button ${answers[question.id] === false ? 'selected' : ''}`}
              onClick={() => handleAnswerChange(question.id, false)}
            >
              <span className="button-icon">✕</span>
              No
            </button>
          </div>
        );
      
      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading survey tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If a survey is active, show the survey questions
  if (activeSurvey) {
    const currentQuestion = activeSurvey.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === activeSurvey.questions.length - 1;
    
    return (
      <div className="container">
        <div 
          className={`active-survey-container ${animateIn ? 'fade-in' : 'fade-out'}`}
          ref={surveyContainerRef}
        >
          <div className="survey-header">
            <div className="survey-company">
              <div className="company-logo-container">
                <img src={activeSurvey.companyLogo} alt={activeSurvey.company} className="company-logo" />
              </div>
              <div className="survey-title-container">
                <h2>{activeSurvey.title}</h2>
                <div className="survey-metadata">
                  <span className="survey-duration">⏱️ {activeSurvey.duration}</span>
                  <span className="survey-category">🏷️ {activeSurvey.category}</span>
                  <span className="survey-reward">💰 KSh {activeSurvey.reward}</span>
                </div>
              </div>
            </div>
            <button className="btn-close-survey" onClick={handleCloseSurvey}>
              ✕
            </button>
          </div>
          
          <div className="survey-progress">
            <div className="progress-text">
              <span>Question {currentQuestionIndex + 1} of {activeSurvey.questions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / activeSurvey.questions.length) * 100)}% Complete</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestionIndex + 1) / activeSurvey.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="survey-question">
            <div className="question-number">Q{currentQuestionIndex + 1}</div>
            <h3 className="question-text">
              {currentQuestion.text}
              {currentQuestion.required && <span className="required-mark">*</span>}
            </h3>
            
            {renderQuestion(currentQuestion)}
          </div>
          
          <div className="survey-navigation">
            {currentQuestionIndex > 0 && (
              <button 
                className="btn btn-secondary btn-with-icon" 
                onClick={handlePrevious}
                disabled={submitting}
              >
                <span className="btn-icon">◀</span>
                Previous
              </button>
            )}
            
            <button 
              className="btn btn-primary btn-with-icon" 
              onClick={handleNext}
              disabled={submitting}
            >
              {isLastQuestion ? 'Submit Survey' : 'Next'}
              {isLastQuestion ? (
                submitting ? <span className="spinner-sm"></span> : <span className="btn-icon">✓</span>
              ) : (
                <span className="btn-icon">▶</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Success Animation Overlay */}
        {showSuccessAnimation && (
          <div className="success-animation-overlay">
            <div className="success-animation-content">
              <div className="success-icon">✓</div>
              <h2>Survey Completed!</h2>
              <div className="reward-animation">
                <span className="reward-text">+KSh {earnedReward}</span>
              </div>
              <p>Thank you for your feedback</p>
            </div>
            <div className="floating-coins">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className="floating-coin"
                  style={{
                    left: `${Math.random() * 90}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${Math.random() * 2 + 2}s`
                  }}
                >
                  {['💰', '💵', '💸', '🪙'][Math.floor(Math.random() * 4)]}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise show the list of available surveys
  return (
    <div className="container">
      <div className={`surveys-header ${animateIn ? 'fade-in' : 'fade-out'}`}>
        <h1>Survey Tasks <span className="header-accent">💬</span></h1>
        <p>Share your opinions on products and services to earn rewards. Each completed survey adds to your balance!</p>
      </div>
      
      <div className="survey-stats">
        <div className="stat-item">
          <span className="stat-value">{completedSurveys.length}</span>
          <span className="stat-label">Surveys Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{surveyData.length - completedSurveys.length}</span>
          <span className="stat-label">Available Surveys</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">KSh {surveyData.reduce((sum, survey) => completedSurveys.includes(survey.id) ? sum + survey.reward : sum, 0)}</span>
          <span className="stat-label">Total Earned</span>
        </div>
      </div>
      
      <div className="surveys-list">
        {surveyData.map((survey, index) => {
          const isCompleted = completedSurveys.includes(survey.id);
          
          return (
            <div 
              key={survey.id} 
              className={`survey-card ${isCompleted ? 'completed' : ''} ${animateIn ? 'fade-in' : 'fade-out'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="survey-card-logo">
                <img src={survey.companyLogo} alt={survey.company} />
              </div>
              
              <div className="survey-card-content">
                <div className="survey-card-header">
                  <h2>{survey.title}</h2>
                  {isCompleted && <span className="completed-badge">Completed</span>}
                </div>
                
                <div className="survey-card-company">{survey.company}</div>
                
                <p className="survey-card-description">{survey.description}</p>
                
                <div className="survey-card-details">
                  <div className="survey-detail">
                    <span className="detail-icon">⏱️</span>
                    <span className="detail-text">{survey.duration}</span>
                  </div>
                  
                  <div className="survey-detail">
                    <span className="detail-icon">🏷️</span>
                    <span className="detail-text">{survey.category}</span>
                  </div>
                  
                  <div className="survey-detail">
                    <span className="detail-icon">📊</span>
                    <span className="detail-text">
                      {survey.difficulty === 'easy' ? 'Easy' : 
                       survey.difficulty === 'medium' ? 'Medium' : 'Hard'}
                    </span>
                  </div>
                  
                  <div className="survey-detail reward">
                    <span className="detail-icon">💰</span>
                    <span className="detail-text">KSh {survey.reward}</span>
                  </div>
                </div>
              </div>
              
              <div className="survey-card-action">
                <button 
                  className={`btn ${isCompleted ? 'btn-completed' : 'btn-primary btn-glow'}`}
                  onClick={() => !isCompleted && handleStartSurvey(survey)}
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <>
                      <span className="btn-icon">✓</span>
                      Completed
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">▶</span>
                      Start Survey
                    </>
                  )}
                </button>
              </div>
              
              {/* Expiry badge */}
              {!isCompleted && (
                <div className="expiry-badge">
                  <span className="expiry-icon">⏳</span>
                  <span className="expiry-text">Expires: {new Date(survey.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className={`survey-info-section ${animateIn ? 'fade-in' : 'fade-out'}`} style={{ animationDelay: '0.5s' }}>
        <div className="info-icon">💡</div>
        <h3>How Survey Tasks Work</h3>
        <ul>
          <li>
            <span className="list-icon">✓</span>
            <span className="list-text">Complete each survey honestly to earn rewards instantly</span>
          </li>
          <li>
            <span className="list-icon">✓</span>
            <span className="list-text">Higher difficulty surveys offer bigger rewards</span>
          </li>
          <li>
            <span className="list-icon">✓</span>
            <span className="list-text">Your opinion helps companies improve their products and services</span>
          </li>
          <li>
            <span className="list-icon">✓</span>
            <span className="list-text">New surveys are added regularly - check back often!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SurveyTasks;