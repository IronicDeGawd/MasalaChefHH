import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({ isConnected, onConnect }) => {
  return (
    <div className="landing-page" style={{
      textAlign: 'center',
      padding: '50px 20px',
      backgroundColor: '#FDF5E6',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div className="header" style={{
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          color: '#8B4513',
          marginBottom: '15px'
        }}>MasalaChef</h1>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#5E3A1F',
          fontWeight: 'normal'
        }}>Learn to cook delicious Indian recipes in a fun, interactive way!</h2>
      </div>
      
      <div className="game-details" style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        marginBottom: '40px'
      }}>
        <h3 style={{ color: '#8B4513', marginBottom: '20px' }}>About MasalaChef</h3>
        <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
          MasalaChef is a 2.5D cooking simulator inspired by Indian cuisine. Learn authentic recipes, 
          master the art of spices, and become a master chef!
        </p>
        
        <div className="features" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          margin: '30px 0'
        }}>
          <div className="feature">
            <h4 style={{ color: '#8B4513' }}>Interactive Cooking</h4>
            <p>Chop, fry, stir and add spices in a realistic environment</p>
          </div>
          <div className="feature">
            <h4 style={{ color: '#8B4513' }}>Learn Recipes</h4>
            <p>Master authentic Indian dishes step by step</p>
          </div>
          <div className="feature">
            <h4 style={{ color: '#8B4513' }}>Get Feedback</h4>
            <p>Receive personalized AI feedback on your cooking</p>
          </div>
        </div>
        
        <p style={{ fontStyle: 'italic', color: '#666' }}>
          Built for the Monad Testnet Hackathon
        </p>
      </div>
      
      <div className="cta-section">
        {isConnected ? (
          <div>
            <p style={{ color: 'green', marginBottom: '15px' }}>
              Wallet connected successfully!
            </p>
            <Link to="/game" style={{
              display: 'inline-block',
              backgroundColor: '#8B4513',
              color: 'white',
              padding: '15px 30px',
              fontSize: '1.2rem',
              textDecoration: 'none',
              borderRadius: '8px',
              margin: '10px 0',
              transition: 'background-color 0.3s'
            }}>
              Start Cooking
            </Link>
            <Link to="/dashboard" style={{
              display: 'block',
              color: '#8B4513',
              marginTop: '10px',
              textDecoration: 'none'
            }}>
              View Dashboard
            </Link>
          </div>
        ) : (
          <button 
            onClick={onConnect}
            style={{
              backgroundColor: '#8B4513',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              fontSize: '1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
          >
            Connect Wallet to Start
          </button>
        )}
      </div>
    </div>
  );
};

export default LandingPage; 