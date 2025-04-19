import React, { useEffect, useRef } from 'react';
import MasalaChefGame from '../game/MasalaChefGame';

const GameComponent = () => {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    // Initialize game only once
    if (!gameRef.current && containerRef.current) {
      gameRef.current = new MasalaChefGame();
      gameRef.current.init(containerRef.current);
    }
    
    // Cleanup when component unmounts
    return () => {
      if (gameRef.current) {
        gameRef.current.game.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);
  
  return (
    <div className="game-wrapper" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100vh'
    }}>
      <div 
        ref={containerRef} 
        id="game-container" 
        style={{ 
          width: '100%', 
          maxWidth: '1280px',
          height: 'auto',
          aspectRatio: '4/3',
          margin: '0 auto',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export default GameComponent; 