// src/components/animations/FloatingCoins.js

import React from 'react';

const coinEmojis = ['💰', '💵', '💸', '🪙', '💎'];

const FloatingCoins = ({ count = 10 }) => {
  // Generate random coins with different properties
  const coins = Array.from({ length: count }, (_, index) => {
    return {
      id: index,
      emoji: coinEmojis[Math.floor(Math.random() * coinEmojis.length)],
      size: Math.floor(Math.random() * 30) + 20, // 20-50px
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10, // 10-20s
      opacity: Math.random() * 0.5 + 0.3 // 0.3-0.8
    };
  });

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
            top: '-50px',
            opacity: coin.opacity,
            animation: `floatCoin ${coin.duration}s linear ${coin.delay}s infinite`,
            zIndex: 1
          }}
        >
          {coin.emoji}
        </div>
      ))}

      <style jsx="true">{`
        @keyframes floatCoin {
          0% {
            transform: translateY(-50px) rotate(0deg);
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