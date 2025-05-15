// src/pages/tasks/survey/SurveyTasks.js

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { useAuth } from '../../../context/AuthContext';
import './SurveyTasks.css';

const SurveyTasks = () => {
  const { currentUser } = useAuth();
  const [surveyTasks, setSurveyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSurveyTasks = async () => {
      try {
        // Create a query against the 'tasks/surveys' collection
        const surveysRef = collection(db, 'tasks/surveys/items');
        const q = query(
          surveysRef,
          // Filter for active tasks only
          where('active', '==', true),
          // Sort by reward amount, highest first
          orderBy('reward', 'desc'),
          // Limit to 10 results
          limit(10)
        );
        
        // Get the documents
        const querySnapshot = await getDocs(q);
        const tasks = [];
        
        querySnapshot.forEach((doc) => {
          tasks.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setSurveyTasks(tasks);
      } catch (err) {
        console.error('Error fetching survey tasks:', err);
        setError('Failed to load survey tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSurveyTasks();
  }, []);
  
  // This would be a real implementation for starting a survey
  const handleStartSurvey = (taskId) => {
    // In a real app, this would navigate to a survey page
    // or open the survey in a new tab
    console.log(`Starting survey task: ${taskId}`);
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
  
  return (
    <div className="container">
      <div className="tasks-header">
        <h1>Survey Tasks</h1>
        <p>Complete surveys to share your opinion and earn rewards.</p>
      </div>
      
      {surveyTasks.length === 0 ? (
        <div className="no-tasks">
          <h2>No Survey Tasks Available</h2>
          <p>Check back later for new survey tasks!</p>
        </div>
      ) : (
        <div className="survey-tasks-container">
          {surveyTasks.map((task) => (
            <div key={task.id} className="survey-task-card">
              <div className="survey-task-content">
                <div className="survey-task-header">
                  <h3>{task.title}</h3>
                  <div className="survey-badge">{task.category}</div>
                </div>
                <p>{task.description}</p>
                <div className="survey-task-details">
                  <div className="survey-detail">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{task.estimatedTimeMinutes} min</span>
                  </div>
                  <div className="survey-detail">
                    <span className="detail-label">Questions:</span>
                    <span className="detail-value">{task.questionCount}</span>
                  </div>
                  <div className="survey-detail">
                    <span className="detail-label">Reward:</span>
                    <span className="detail-value reward-amount">KSh {task.reward}</span>
                  </div>
                </div>
              </div>
              <div className="survey-task-action">
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleStartSurvey(task.id)}
                >
                  Start Survey
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="task-note">
        <h3>How Survey Tasks Work</h3>
        <ul>
          <li>Complete the entire survey to earn your reward</li>
          <li>Answer all questions truthfully to avoid disqualification</li>
          <li>Each survey can only be completed once</li>
          <li>Rewards are credited to your account after verification</li>
        </ul>
      </div>
    </div>
  );
};

export default SurveyTasks;