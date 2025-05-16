// src/pages/tasks/video/components/VideoTaskCard.js

import React from 'react';
import './VideoTaskCard.css';

// Enhanced getVideoThumbnail function with support for more platforms
const getVideoThumbnail = (videoUrl) => {
  if (!videoUrl) return null;
  
  try {
    const url = new URL(videoUrl);
    const hostname = url.hostname;
    const pathname = url.pathname;
    const searchParams = new URLSearchParams(url.search);
    
    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId = '';
      
      if (hostname.includes('youtube.com')) {
        if (pathname.includes('/watch')) {
          videoId = searchParams.get('v');
        } else if (pathname.includes('/embed/') || pathname.includes('/v/')) {
          videoId = pathname.split('/').pop();
        } else if (pathname.includes('/shorts/')) {
          videoId = pathname.split('/shorts/')[1].split('/')[0];
        }
      } else if (hostname.includes('youtu.be')) {
        videoId = pathname.substring(1); // Remove leading slash
      }
      
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    
    // Vimeo
    if (hostname.includes('vimeo.com')) {
      const vimeoId = pathname.substring(1).split('/')[0]; // Get the ID after the slash
      if (vimeoId && !isNaN(vimeoId)) {
        // Note: For reliable Vimeo thumbnails, an API call would be needed
        // Using a branded placeholder for now
        return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2300ADEF;stop-opacity:1" /><stop offset="100%" style="stop-color:%230066B3;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad)" width="320" height="180"/><text fill="white" font-family="sans-serif" font-size="18" font-weight="bold" dy="0.35em" text-anchor="middle" x="160" y="90">Vimeo</text></svg>`;
      }
    }
    
    // Facebook
    if (hostname.includes('facebook.com') || hostname.includes('fb.watch')) {
      return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%233b5998;stop-opacity:1" /><stop offset="100%" style="stop-color:%238b9dc3;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad)" width="320" height="180"/><text fill="white" font-family="sans-serif" font-size="18" font-weight="bold" dy="0.35em" text-anchor="middle" x="160" y="90">Facebook Video</text></svg>`;
    }
    
    // Dailymotion
    if (hostname.includes('dailymotion.com') || hostname.includes('dai.ly')) {
      let videoId = '';
      if (hostname.includes('dailymotion.com')) {
        if (pathname.includes('/video/')) {
          videoId = pathname.split('/video/')[1].split('_')[0];
        }
      } else if (hostname.includes('dai.ly')) {
        videoId = pathname.substring(1);
      }
      
      if (videoId) {
        return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
      }
    }
    
    // Twitch
    if (hostname.includes('twitch.tv')) {
      return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%236441A4;stop-opacity:1" /><stop offset="100%" style="stop-color:%239146FF;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad)" width="320" height="180"/><text fill="white" font-family="sans-serif" font-size="18" font-weight="bold" dy="0.35em" text-anchor="middle" x="160" y="90">Twitch</text></svg>`;
    }
    
    // Wistia
    if (hostname.includes('wistia.com') || videoUrl.includes('wistia.net')) {
      let videoId = '';
      if (pathname.includes('/medias/')) {
        videoId = pathname.split('/medias/')[1];
      } else if (searchParams.has('wvideo')) {
        videoId = searchParams.get('wvideo');
      }
      
      if (videoId) {
        return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%2356be8e;stop-opacity:1" /><stop offset="100%" style="stop-color:%2354bbff;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad)" width="320" height="180"/><text fill="white" font-family="sans-serif" font-size="18" font-weight="bold" dy="0.35em" text-anchor="middle" x="160" y="90">Wistia</text></svg>`;
      }
    }
    
    // Brightcove
    if (videoUrl.includes('brightcove')) {
      return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><rect fill="%23333333" width="320" height="180"/><text fill="white" font-family="sans-serif" font-size="18" font-weight="bold" dy="0.35em" text-anchor="middle" x="160" y="90">Brightcove</text></svg>`;
    }
    
    // Vidyard
    if (hostname.includes('vidyard.com')) {
      return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23404040;stop-opacity:1" /><stop offset="100%" style="stop-color:%23787878;stop-opacity:1" /></linearGradient></defs><rect fill="url(%23grad)" width="320" height="180"/><text fill="white" font-family="sans-serif" font-size="18" font-weight="bold" dy="0.35em" text-anchor="middle" x="160" y="90">Vidyard</text></svg>`;
    }
    
    // Default video thumbnail for unsupported platforms
    return createDefaultThumbnail();
    
  } catch (error) {
    console.error("Error generating video thumbnail:", error);
    return createDefaultThumbnail();
  }
};

// Function to create default video thumbnail SVG
const createDefaultThumbnail = () => {
  return `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
    <rect fill="%23f0f0f0" width="320" height="180"/>
    <rect fill="%23e0e0e0" x="110" y="50" width="100" height="80" rx="10"/>
    <polygon fill="%23999999" points="140,70 140,110 170,90"/>
    <text fill="%23999999" font-family="sans-serif" font-size="14" dy="0.35em" text-anchor="middle" x="160" y="150">Video Task</text>
  </svg>`;
};

const VideoTaskCard = ({ video, onWatch, watched }) => {
  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`video-card ${watched ? 'video-watched' : ''}`}>
      <div className="video-thumbnail">
        <img 
          src={video.thumbnailUrl || getVideoThumbnail(video.url) || createDefaultThumbnail()}
          alt={video.title} 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = createDefaultThumbnail();
          }}
        />
        <div className="video-duration">{formatDuration(video.duration)}</div>
        
        {watched && (
          <div className="watched-badge">
            <span className="watched-icon">✓</span>
            Completed
          </div>
        )}
      </div>
      
      <div className="video-content">
        <h3 className="video-title">{video.title}</h3>
        <p className="video-description">{video.description}</p>
        
        <div className="video-meta">
          <div className="video-source">
            <span className="source-icon">
              {video.url.includes('youtube') ? '📹' : 
               video.url.includes('vimeo') ? '🎬' : 
               video.url.includes('facebook') ? '📱' :
               video.url.includes('dailymotion') ? '🎥' :
               video.url.includes('twitch') ? '🎮' : '🎥'}
            </span>
            {video.url.includes('youtube') ? 'YouTube' : 
             video.url.includes('vimeo') ? 'Vimeo' : 
             video.url.includes('facebook') ? 'Facebook' :
             video.url.includes('dailymotion') ? 'Dailymotion' :
             video.url.includes('twitch') ? 'Twitch' : 'Video'}
          </div>
          
          <div className="video-category">{video.category}</div>
        </div>
      </div>
      
      <div className="video-action">
        <div className="video-reward">
          <span className="reward-label">Reward</span>
          <span className="reward-amount">KSh {video.reward}</span>
        </div>
        
        <button 
          className={`btn-watch ${watched ? 'btn-watched' : ''}`}
          onClick={onWatch}
          disabled={watched}
        >
          {watched ? (
            <>
              <span className="btn-icon">✓</span>
              Completed
            </>
          ) : (
            <>
              <span className="btn-icon">▶</span>
              Watch & Earn
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoTaskCard;