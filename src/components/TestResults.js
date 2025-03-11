import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const ResultsContainer = styled.div`
  width: 100%;
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  color: white;
`;

const ResultsHeader = styled.h2`
  color: #646cff;
  margin-bottom: 20px;
  text-align: center;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ResultCard = styled.div`
  background-color: #242424;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
`;

const ResultLabel = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 5px;
`;

const ResultValue = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: #646cff;
`;

const ChartContainer = styled.div`
  margin-top: 30px;
  height: 300px;
`;

const RestartButton = styled.button`
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  margin-top: 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s ease;
  display: block;
  margin: 30px auto 0;
  
  &:hover {
    background-color: #535bf2;
  }
`;

const TestResults = ({ 
  wpm, 
  rawWpm, 
  accuracy, 
  charactersTyped, 
  errorCount, 
  errorMap, 
  testDuration,
  onRestart 
}) => {
  const [testHistory, setTestHistory] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTestHistory = async () => {
      if (!currentUser) return;
      
      try {
        const testsRef = collection(db, 'tests');
        const q = query(
          testsRef,
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const tests = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().getTime()
        }));
        
        setTestHistory(tests.reverse());
      } catch (error) {
        console.error('Error fetching test history:', error);
      }
    };
    
    fetchTestHistory();
  }, [currentUser]);

  // Calculate characters per minute
  const cpm = charactersTyped / (testDuration / 60);

  // Calculate time per character (in milliseconds)
  const timePerChar = testDuration * 1000 / charactersTyped;

  return (
    <ResultsContainer>
      <ResultsHeader>Test Results</ResultsHeader>
      
      <ResultsGrid>
        <ResultCard>
          <ResultLabel>WPM</ResultLabel>
          <ResultValue>{wpm}</ResultValue>
        </ResultCard>
        
        <ResultCard>
          <ResultLabel>Raw WPM</ResultLabel>
          <ResultValue>{rawWpm}</ResultValue>
        </ResultCard>
        
        <ResultCard>
          <ResultLabel>Accuracy</ResultLabel>
          <ResultValue>{accuracy}%</ResultValue>
        </ResultCard>
        
        <ResultCard>
          <ResultLabel>Characters</ResultLabel>
          <ResultValue>{charactersTyped}</ResultValue>
        </ResultCard>
        
        <ResultCard>
          <ResultLabel>CPM</ResultLabel>
          <ResultValue>{Math.round(cpm)}</ResultValue>
        </ResultCard>
        
        <ResultCard>
          <ResultLabel>Time/Char</ResultLabel>
          <ResultValue>{timePerChar.toFixed(1)}ms</ResultValue>
        </ResultCard>
      </ResultsGrid>
      
      {currentUser && testHistory.length > 0 && (
        <ChartContainer>
          <Line
            data={{
              labels: testHistory.map((test, index) => `Test ${index + 1}`),
              datasets: [
                {
                  label: 'WPM',
                  data: testHistory.map(test => test.wpm),
                  borderColor: '#646cff',
                  backgroundColor: 'rgba(100, 108, 255, 0.2)',
                  tension: 0.3,
                },
                {
                  label: 'Accuracy %',
                  data: testHistory.map(test => test.accuracy),
                  borderColor: '#4caf50',
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  tension: 0.3,
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: { color: '#fff' }
                },
                title: {
                  display: true,
                  text: 'Performance History',
                  color: '#fff',
                  font: { size: 16 }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { color: '#888' },
                  grid: { color: '#333' }
                },
                x: {
                  ticks: { color: '#888' },
                  grid: { color: '#333' }
                }
              }
            }}
          />
        </ChartContainer>
      )}
      
      <RestartButton onClick={onRestart}>Restart Test</RestartButton>
    </ResultsContainer>
  );
};

export default TestResults;
// Remove Bar chart imports and config
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

// Remove errorChartData and chartOptions constants