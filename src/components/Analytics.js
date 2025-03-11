import React, { useState } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsContainer = styled.div`
  background-color: #1a1a1a;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  width: 100%;
`;

const ChartTitle = styled.h3`
  color: white;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FilterLabel = styled.label`
  color: #888;
  font-size: 14px;
`;

const FilterSelect = styled.select`
  background-color: #242424;
  color: white;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #646cff;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: #888;
  padding: 30px;
  font-size: 16px;
`;

const Analytics = ({ testHistory }) => {
  const [timeRange, setTimeRange] = useState('all');
  const [testType, setTestType] = useState('all');
  
  if (!testHistory || testHistory.length === 0) {
    return (
      <AnalyticsContainer>
        <ChartTitle>Performance Analytics</ChartTitle>
        <NoDataMessage>
          No test data available. Complete some typing tests to see your analytics.
        </NoDataMessage>
      </AnalyticsContainer>
    );
  }
  
  // Filter test history based on selected filters
  const filteredTests = testHistory.filter(test => {
    // Filter by time range
    if (timeRange !== 'all') {
      const testDate = new Date(test.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now - testDate) / (1000 * 60 * 60 * 24));
      
      if (timeRange === 'week' && daysDiff > 7) return false;
      if (timeRange === 'month' && daysDiff > 30) return false;
      if (timeRange === 'year' && daysDiff > 365) return false;
    }
    
    // Filter by test type (if available in your data)
    if (testType !== 'all' && test.testType !== testType) {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Prepare chart data
  const labels = filteredTests.map(test => {
    const date = new Date(test.timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'WPM',
        data: filteredTests.map(test => test.wpm),
        borderColor: '#646cff',
        backgroundColor: 'rgba(100, 108, 255, 0.2)',
        yAxisID: 'y',
        tension: 0.3,
      },
      {
        label: 'Accuracy %',
        data: filteredTests.map(test => test.accuracy),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        yAxisID: 'y1',
        tension: 0.3,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff',
        },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const test = filteredTests[index];
            const date = new Date(test.timestamp);
            return `${date.toLocaleDateString()} - Test #${filteredTests.length - index}`;
          },
          afterBody: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const test = filteredTests[index];
            return [
              `Characters: ${test.charactersTyped}`,
              `Errors: ${test.errorCount || 0}`,
              `Duration: ${test.testDuration}s`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'WPM',
          color: '#646cff',
        },
        ticks: {
          color: '#888',
        },
        grid: {
          color: '#333',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Accuracy %',
          color: '#4caf50',
        },
        min: 0,
        max: 100,
        ticks: {
          color: '#888',
        },
        grid: {
          drawOnChartArea: false,
          color: '#333',
        },
      },
      x: {
        ticks: {
          color: '#888',
        },
        grid: {
          color: '#333',
        },
      },
    },
  };
  
  return (
    <AnalyticsContainer>
      <ChartTitle>Performance Analytics</ChartTitle>
      
      <FilterContainer>
        <FilterGroup>
          <FilterLabel>Time Range:</FilterLabel>
          <FilterSelect 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Test Type:</FilterLabel>
          <FilterSelect 
            value={testType} 
            onChange={(e) => setTestType(e.target.value)}
          >
            <option value="all">All Tests</option>
            <option value="timed">Timed Tests</option>
            <option value="wordCount">Word Count Tests</option>
          </FilterSelect>
        </FilterGroup>
      </FilterContainer>
      
      <div style={{ height: '400px' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </AnalyticsContainer>
  );
};

export default Analytics;