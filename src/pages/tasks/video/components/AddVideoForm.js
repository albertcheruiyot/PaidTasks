// src/pages/tasks/video/components/AddVideoForm.js

import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import './AddVideoForm.css';

const AddVideoForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [reward, setReward] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // URL validation function
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };
  
  // Check if URL is from a supported source
  const isSupportedVideoUrl = (url) => {
    return ReactPlayer.canPlay(url);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    if (!title || !description || !url || !duration || !category || !reward) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (!isValidUrl(url)) {
      setError('Please enter a valid video URL');
      return;
    }
    
    if (!isSupportedVideoUrl(url)) {
      setError('URL not supported. Please use YouTube, Vimeo, or other supported sources');
      return;
    }
    
    if (thumbnailUrl && !isValidUrl(thumbnailUrl)) {
      setError('Please enter a valid thumbnail URL or leave it blank');
      return;
    }
    
    const durationValue = parseInt(duration);
    if (isNaN(durationValue) || durationValue <= 0) {
      setError('Please enter a valid duration in seconds');
      return;
    }
    
    const rewardValue = parseInt(reward);
    if (isNaN(rewardValue) || rewardValue <= 0) {
      setError('Please enter a valid reward amount');
      return;
    }
    
    try {
      setLoading(true);
      
      // Submit the video data
      await onSubmit({
        title,
        description,
        url,
        thumbnailUrl: thumbnailUrl || '', // Use empty string if no thumbnail provided
        duration: durationValue,
        category,
        reward: rewardValue
      });
      
      // Reset form after successful submission
      setTitle('');
      setDescription('');
      setUrl('');
      setThumbnailUrl('');
      setDuration('');
      setCategory('');
      setReward('');
      
    } catch (err) {
      setError('Failed to submit video. Please try again.');
      console.error('Error submitting video:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form className="add-video-form" onSubmit={handleSubmit}>
      {error && (
        <div className="form-error">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      )}
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="title">Video Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">Select category</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Education">Education</option>
            <option value="Technology">Technology</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Sports">Sports</option>
            <option value="News">News</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter video description"
          rows={3}
          required
          disabled={loading}
        ></textarea>
      </div>
      
      <div className="form-group">
        <label htmlFor="url">Video URL *</label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="e.g., https://www.youtube.com/watch?v=..."
          required
          disabled={loading}
        />
        <small className="form-help">YouTube, Vimeo, Facebook, or other supported sources</small>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="thumbnailUrl">Thumbnail URL</label>
          <input
            type="url"
            id="thumbnailUrl"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="Optional thumbnail image URL"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="duration">Duration (seconds) *</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Video duration in seconds"
            min="1"
            required
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="reward">Reward Amount (KSh) *</label>
        <input
          type="number"
          id="reward"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          placeholder="Reward amount"
          min="1"
          required
          disabled={loading}
        />
      </div>
      
      <div className="form-actions">
        <button
          type="submit"
          className="btn-submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-sm"></span>
              Submitting...
            </>
          ) : 'Submit Video'}
        </button>
      </div>
    </form>
  );
};

export default AddVideoForm;