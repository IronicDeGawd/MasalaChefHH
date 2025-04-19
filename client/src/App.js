import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GameComponent from './components/GameComponent';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  // Function to handle wallet connection
  const handleConnect = () => {
    // For MVP, just simulate wallet connection
    console.log('Connecting wallet...');
    setIsConnected(true);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <LandingPage 
              isConnected={isConnected} 
              onConnect={handleConnect} 
            />
          } />
          <Route path="/game" element={
            isConnected ? <GameComponent /> : <Navigate to="/" />
          } />
          <Route path="/dashboard" element={
            isConnected ? <Dashboard /> : <Navigate to="/" />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 