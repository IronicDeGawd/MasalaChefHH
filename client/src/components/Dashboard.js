import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Mock data for the dashboard
  const mockCookingHistory = [
    {
      id: 1,
      recipe: 'Aloo Bhujia',
      date: '2023-06-15',
      time: '12:30 PM',
      duration: '6m 45s',
      score: '4.5/5',
      feedback: 'Great job! The spice balance was perfect.'
    },
    {
      id: 2,
      recipe: 'Aloo Bhujia',
      date: '2023-06-14',
      time: '03:15 PM',
      duration: '8m 20s',
      score: '3.8/5',
      feedback: 'Good attempt, but the potatoes were a bit undercooked.'
    }
  ];

  return (
    <div className="dashboard" style={{
      padding: '30px',
      backgroundColor: '#FDF5E6',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div className="dashboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ color: '#8B4513' }}>MasalaChef Dashboard</h1>
        <div>
          <Link to="/game" style={{
            backgroundColor: '#8B4513',
            color: 'white',
            padding: '10px 20px',
            textDecoration: 'none',
            borderRadius: '5px',
            marginRight: '10px'
          }}>
            Play Game
          </Link>
          <Link to="/" style={{
            color: '#8B4513',
            textDecoration: 'none'
          }}>
            Home
          </Link>
        </div>
      </div>

      <div className="dashboard-content" style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          color: '#8B4513', 
          marginBottom: '20px',
          borderBottom: '2px solid #EBD5C5',
          paddingBottom: '10px'
        }}>
          Your Cooking History
        </h2>

        {mockCookingHistory.length > 0 ? (
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#EBD5C5',
                textAlign: 'left'
              }}>
                <th style={{ padding: '12px' }}>Recipe</th>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Time</th>
                <th style={{ padding: '12px' }}>Duration</th>
                <th style={{ padding: '12px' }}>Score</th>
                <th style={{ padding: '12px' }}>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {mockCookingHistory.map(entry => (
                <tr key={entry.id} style={{
                  borderBottom: '1px solid #EBD5C5'
                }}>
                  <td style={{ padding: '12px' }}>{entry.recipe}</td>
                  <td style={{ padding: '12px' }}>{entry.date}</td>
                  <td style={{ padding: '12px' }}>{entry.time}</td>
                  <td style={{ padding: '12px' }}>{entry.duration}</td>
                  <td style={{ padding: '12px' }}>{entry.score}</td>
                  <td style={{ padding: '12px' }}>{entry.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '30px',
            color: '#666'
          }}>
            <p>You haven't cooked any recipes yet!</p>
            <Link to="/game" style={{
              display: 'inline-block',
              marginTop: '15px',
              backgroundColor: '#8B4513',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '5px'
            }}>
              Start Cooking
            </Link>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '30px',
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ 
          color: '#8B4513', 
          marginBottom: '20px',
          borderBottom: '2px solid #EBD5C5',
          paddingBottom: '10px'
        }}>
          Blockchain Transaction History
        </h2>
        
        <p style={{
          color: '#666',
          textAlign: 'center',
          padding: '20px'
        }}>
          Your cooking results are securely stored on the Monad blockchain.
          This feature will be fully implemented in the complete version.
        </p>
      </div>
    </div>
  );
};

export default Dashboard; 