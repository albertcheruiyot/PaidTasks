// src/components/animations/FloatingCoins.js

import React from 'react';

const coinEmojis = ['💰', '💵', '💸', '🪙', '💎'];

/**
 * FloatingCoins component for decorative animated coins
 * @param {Object} props
 * @param {Number} props.count - Number of coins to display
 * @param {String} props.direction - Animation direction ('up' or 'down')
 * @param {Number} props.minSize - Minimum coin size
 * @param {Number} props.maxSize - Maximum coin size
 */
const FloatingCoins = ({ 
  count = 10, 
  direction = 'up',
  minSize = 20,
  maxSize = 50
}) => {
  // Generate random coins with different properties
  const coins = React.useMemo(() => {
    return Array.from({ length: count }, (_, index) => {
      return {
        id: index,
        emoji: coinEmojis[Math.floor(Math.random() * coinEmojis.length)],
        size: Math.floor(Math.random() * (maxSize - minSize)) + minSize,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 10, // 10-20s
        opacity: Math.random() * 0.5 + 0.3, // 0.3-0.8
        rotation: Math.random() * 360
      };
    });
  }, [count, minSize, maxSize]);

  return (
    <>
      {coins.map(coin => (
        <div
          key={coin.id}
          className="floating-coin"
          style={{
            position: 'absolute',
            fontSize: `${coin.size}px`,
            left: coin.left,
            top: direction === 'up' ? 'auto' : '-50px',
            bottom: direction === 'up' ? '-50px' : 'auto',
            opacity: coin.opacity,
            animation: `float${direction === 'up' ? 'Up' : 'Down'} ${coin.duration}s linear ${coin.delay}s infinite`,
            zIndex: 1,
            transform: `rotate(${coin.rotation}deg)`
          }}
        >
          {coin.emoji}
        </div>
      ))}

      <style jsx="true">{`
        @keyframes floatUp {
          0% {
            transform: translateY(20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: ${props => props.opacity};
          }
          90% {
            opacity: ${props => props.opacity};
          }
          100% {
            transform: translateY(calc(-100vh - 50px)) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes floatDown {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: ${props => props.opacity};
          }
          90% {
            opacity: ${props => props.opacity};
          }
          100% {
            transform: translateY(calc(100vh + 50px)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default FloatingCoins;