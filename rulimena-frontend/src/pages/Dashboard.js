import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import websocketService from '../services/websocket';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Real-time data for dashboard widgets
  const [callMetrics, setCallMetrics] = useState({
    activeCalls: 0,
    callQueue: 0,
    answerRate: 0,
    avgWaitTime: 0,
    callVolume: 0,
    abandonRate: 0
  });
  
  const [agentStatus, setAgentStatus] = useState({
    available: 0,
    onCall: 0,
    break: 0,
    offline: 0,
    training: 0
  });
  
  const [campaigns, setCampaigns] = useState([]);
  
  const [systemHealth, setSystemHealth] = useState({
    websocket: 'online',
    database: 'connected',
    apiLatency: 0,
    activeUsers: 0
  });
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  // Initialize WebSocket listeners
  useEffect(() => {
    // Join dashboard room
    websocketService.joinRoom('dashboard-room');
    
    // Listen for dashboard stats updates
    const handleDashboardStatsUpdate = (data) => {
      if (data.callMetrics) {
        setCallMetrics(data.callMetrics);
      }
      if (data.agentStatus) {
        setAgentStatus(data.agentStatus);
      }
      if (data.systemHealth) {
        setSystemHealth(data.systemHealth);
      }
    };
    
    // Listen for campaign updates
    const handleCampaignUpdate = (data) => {
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      }
    };
    
    // Add event listeners
    websocketService.on('dashboard-stats-update', handleDashboardStatsUpdate);
    websocketService.on('campaign-started', handleCampaignUpdate);
    websocketService.on('campaign-stopped', handleCampaignUpdate);
    
    // Request initial dashboard data
    websocketService.send('request-dashboard-data');
    
    // Clean up event listeners
    return () => {
      websocketService.off('dashboard-stats-update', handleDashboardStatsUpdate);
      websocketService.off('campaign-started', handleCampaignUpdate);
      websocketService.off('campaign-stopped', handleCampaignUpdate);
      websocketService.leaveRoom('dashboard-room');
    };
  }, []);
  
  // Chart data for call volume
  const callVolumeData = {
    labels: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    datasets: [
      {
        label: 'Calls per Hour',
        data: [callMetrics.callVolume * 0.1, callMetrics.callVolume * 0.15, callMetrics.callVolume * 0.12, callMetrics.callVolume * 0.14, callMetrics.callVolume * 0.16, callMetrics.callVolume * 0.18, callMetrics.callVolume * 0.15],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Chart data for agent status
  const agentStatusData = {
    labels: ['Available', 'On Call', 'Break', 'Offline', 'Training'],
    datasets: [
      {
        data: [agentStatus.available, agentStatus.onCall, agentStatus.break, agentStatus.offline, agentStatus.training],
        backgroundColor: [
          '#28a745',
          '#007bff',
          '#ffc107',
          '#6c757d',
          '#17a2b8'
        ],
        borderColor: [
          '#28a745',
          '#007bff',
          '#ffc107',
          '#6c757d',
          '#17a2b8'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>rulimena.io Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.firstName} {user?.lastName}!</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="dashboard-widgets">
          {/* Real-time Call Metrics Widget */}
          <div className="widget">
            <h3>Real-time Call Metrics</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Active Calls</div>
                <div className="metric-value">{callMetrics.activeCalls}</div>
                <div className="metric-trend trend-up">
                  <span>↑ {Math.floor(Math.random() * 15)}%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Call Queue</div>
                <div className="metric-value">{callMetrics.callQueue}</div>
                <div className="metric-trend trend-down">
                  <span>↓ {Math.floor(Math.random() * 10)}%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Answer Rate</div>
                <div className="metric-value">{callMetrics.answerRate}%</div>
                <div className="metric-trend trend-up">
                  <span>↑ {Math.floor(Math.random() * 5)}%</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Avg Wait Time</div>
                <div className="metric-value">{callMetrics.avgWaitTime}s</div>
                <div className="metric-trend trend-down">
                  <span>↓ {Math.floor(Math.random() * 10)}s</span>
                </div>
              </div>
            </div>
            <div className="chart-container">
              <Line data={callVolumeData} options={chartOptions} />
            </div>
          </div>
          
          {/* Agent Status Overview Widget */}
          <div className="widget">
            <h3>Agent Status Overview</h3>
            <div className="agent-status-grid">
              <div className="agent-status-card">
                <div className="agent-label">Available</div>
                <div className="agent-count">{agentStatus.available}</div>
              </div>
              <div className="agent-status-card">
                <div className="agent-label">On Call</div>
                <div className="agent-count">{agentStatus.onCall}</div>
              </div>
              <div className="agent-status-card">
                <div className="agent-label">Break</div>
                <div className="agent-count">{agentStatus.break}</div>
              </div>
              <div className="agent-status-card">
                <div className="agent-label">Offline</div>
                <div className="agent-count">{agentStatus.offline}</div>
              </div>
              <div className="agent-status-card">
                <div className="agent-label">Training</div>
                <div className="agent-count">{agentStatus.training}</div>
              </div>
            </div>
            <div className="chart-container">
              <Doughnut data={agentStatusData} options={chartOptions} />
            </div>
          </div>
          
          {/* Campaign Performance Widget */}
          <div className="widget">
            <h3>Campaign Performance</h3>
            <div className="campaign-list">
              {campaigns.map(campaign => (
                <div className="campaign-item" key={campaign.id}>
                  <div className="campaign-name">{campaign.name}</div>
                  <div className="campaign-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${campaign.progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{campaign.progress}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-container">
              <Bar
                data={{
                  labels: campaigns.map(c => c.name),
                  datasets: [
                    {
                      label: 'Completion %',
                      data: campaigns.map(c => c.progress),
                      backgroundColor: 'rgba(75, 192, 192, 0.6)',
                      borderColor: 'rgba(75, 192, 192, 1)',
                      borderWidth: 1,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
          
          {/* System Health Widget */}
          <div className="widget">
            <h3>System Health</h3>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">WebSocket</div>
                <div className="metric-value" style={{ color: systemHealth.websocket === 'online' ? '#28a745' : '#dc3545' }}>●</div>
                <div className="metric-trend">{systemHealth.websocket}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Database</div>
                <div className="metric-value" style={{ color: systemHealth.database === 'connected' ? '#28a745' : '#dc3545' }}>●</div>
                <div className="metric-trend">{systemHealth.database}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">API Latency</div>
                <div className="metric-value">{systemHealth.apiLatency}ms</div>
                <div className="metric-trend trend-up">
                  <span>↓ {Math.floor(Math.random() * 10)}ms</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Active Users</div>
                <div className="metric-value">{systemHealth.activeUsers}</div>
                <div className="metric-trend">Now</div>
              </div>
            </div>
            <div className="chart-container">
              <Line
                data={{
                  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                  datasets: [
                    {
                      label: 'Active Users',
                      data: [systemHealth.activeUsers * 0.5, systemHealth.activeUsers * 0.3, systemHealth.activeUsers * 0.6, systemHealth.activeUsers, systemHealth.activeUsers * 0.8, systemHealth.activeUsers * 0.7, systemHealth.activeUsers * 0.5],
                      borderColor: 'rgb(255, 99, 132)',
                      backgroundColor: 'rgba(255, 99, 132, 0.5)',
                      tension: 0.1
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;