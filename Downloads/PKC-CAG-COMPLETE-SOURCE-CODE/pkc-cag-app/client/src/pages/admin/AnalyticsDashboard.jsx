// client/src/pages/admin/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, BarChart, LineChart, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [paymentStats, setPaymentStats] = useState([]);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, days]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('🔄 [Analytics] Fetching analytics data with period:', period, 'days:', days);

      // Fetch each endpoint separately to identify which ones fail
      try {
        const dashboard = await API.get('/analytics/dashboard');
        console.log('✅ [Chart 0] Dashboard loaded:', dashboard.data);
        const dashData = dashboard.data?.data || dashboard.data;
        setDashboardData(dashData);
      } catch (err) {
        console.error('❌ [Chart 0] Dashboard failed:', err.message);
        setDashboardData(null);
      }

      try {
        const revenue = await API.get(`/analytics/revenue-trends?period=${period}&days=${days}`);
        console.log('✅ [Chart 1] Revenue Trends loaded, count:', revenue.data?.data?.length || 0);
        const revData = revenue.data?.data || revenue.data || [];
        setRevenueTrends(Array.isArray(revData) ? revData : []);
      } catch (err) {
        console.error('❌ [Chart 1] Revenue Trends failed:', err.message);
        setRevenueTrends([]);
      }

      try {
        const services = await API.get('/analytics/top-services?limit=5');
        console.log('✅ [Chart 2] Top Services loaded, count:', services.data?.data?.length || 0);
        const servData = services.data?.data || services.data || [];
        setTopServices(Array.isArray(servData) ? servData : []);
      } catch (err) {
        console.error('❌ [Chart 2] Top Services failed:', err.message);
        setTopServices([]);
      }

      try {
        const payment = await API.get('/analytics/payment');
        console.log('✅ [Chart 3] Payment Analytics loaded, count:', payment.data?.data?.length || 0);
        const payData = payment.data?.data || payment.data || [];
        setPaymentStats(Array.isArray(payData) ? payData : []);
      } catch (err) {
        console.error('❌ [Chart 3] Payment Analytics failed:', err.message);
        setPaymentStats([]);
      }

      try {
        const users = await API.get(`/analytics/users?days=${days}`);
        console.log('✅ [Chart 4] User Analytics loaded');
        const userData = users.data?.data || users.data || {};
        setUserAnalytics(userData);
      } catch (err) {
        console.error('❌ [Chart 4] User Analytics failed:', err.message);
        setUserAnalytics({});
      }

      console.log('✅ [Analytics] All endpoints processed');
    } catch (error) {
      console.error('❌ [Analytics] Unexpected error:', error);
      toast.error('Failed to load analytics: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const response = await API.get(
        `/analytics/export?startDate=${startDate}&endDate=${endDate}`
      );

      // Convert to CSV and download
      const csv = convertToCSV(response.data.data);
      downloadCSV(csv, `analytics-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0] || {});
    const rows = data.map((obj) => headers.map((header) => obj[header] || '').join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.setAttribute('download', filename);
    link.click();
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <div className="loader-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <h1>📊 Analytics Dashboard</h1>

      {/* Chart Status Indicator */}
      <div className="chart-status">
        <div className={`status-indicator ${revenueTrends.length > 0 ? 'active' : 'inactive'}`}>
          Chart 1: Revenue Trends {revenueTrends.length > 0 ? '✅' : '⚠️'}
        </div>
        <div className={`status-indicator ${topServices.length > 0 ? 'active' : 'inactive'}`}>
          Chart 2: Top Services {topServices.length > 0 ? '✅' : '⚠️'}
        </div>
        <div className={`status-indicator ${paymentStats.length > 0 ? 'active' : 'inactive'}`}>
          Chart 3: Payment Status {paymentStats.length > 0 ? '✅' : '⚠️'}
        </div>
        <div className={`status-indicator ${userAnalytics?.newUsersTrend?.length > 0 ? 'active' : 'inactive'}`}>
          Chart 4: User Acquisition {userAnalytics?.newUsersTrend?.length > 0 ? '✅' : '⚠️'}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Total Revenue</h3>
          <p className="kpi-value">₹{parseFloat(dashboardData?.totalRevenue || 0).toLocaleString()}</p>
          <span className="kpi-label">All time</span>
        </div>
        <div className="kpi-card">
          <h3>Total Orders</h3>
          <p className="kpi-value">{dashboardData?.totalOrders || 0}</p>
          <span className="kpi-label">{dashboardData?.recentOrders30Days || 0} in 30 days</span>
        </div>
        <div className="kpi-card">
          <h3>Total Users</h3>
          <p className="kpi-value">{dashboardData?.totalUsers || 0}</p>
          <span className="kpi-label">{dashboardData?.newUsers30Days || 0} new this month</span>
        </div>
        <div className="kpi-card">
          <h3>Avg Order Value</h3>
          <p className="kpi-value">₹{parseFloat(dashboardData?.averageOrderValue || 0).toFixed(2)}</p>
          <span className="kpi-label">Average</span>
        </div>
      </div>

      {/* Controls */}
      <div className="analytics-controls">
        <div className="control-group">
          <label>Period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="control-group">
          <label>Days:</label>
          <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
        <button className="btn-export" onClick={handleExport}>
          📥 Export Data
        </button>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Revenue Trends */}
        {revenueTrends && revenueTrends.length > 0 ? (
          <div className="chart-card">
            <h2>Revenue Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrends}>
                <CartesianGrid />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-card">
            <h2>Revenue Trends</h2>
            <p className="no-data">No revenue data available</p>
          </div>
        )}

        {/* Top Services */}
        {topServices && topServices.length > 0 ? (
          <div className="chart-card">
            <h2>Top Services by Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServices}>
                <CartesianGrid />
                <XAxis dataKey="serviceName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
                <Bar dataKey="ordersCount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-card">
            <h2>Top Services by Revenue</h2>
            <p className="no-data">No service data available</p>
          </div>
        )}

        {/* Payment Status */}
        {paymentStats && paymentStats.length > 0 ? (
          <div className="chart-card">
            <h2>Payment Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentStats}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-card">
            <h2>Payment Status Distribution</h2>
            <p className="no-data">No payment data available</p>
          </div>
        )}

        {/* New Users */}
        {userAnalytics?.newUsersTrend && userAnalytics.newUsersTrend.length > 0 ? (
          <div className="chart-card">
            <h2>New User Acquisition</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userAnalytics.newUsersTrend}>
                <CartesianGrid />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-card">
            <h2>New User Acquisition</h2>
            <p className="no-data">No user trend data available</p>
          </div>
        )}
      </div>

      {/* User Stats */}
      <div className="stats-section">
        <h2>User Statistics</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <strong>Total Users</strong>
            <p>{userAnalytics?.stats?.totalUsers || 0}</p>
          </div>
          <div className="stat-box">
            <strong>Verified Users</strong>
            <p>{userAnalytics?.stats?.verifiedUsers || 0}</p>
          </div>
          <div className="stat-box">
            <strong>Google Auth Users</strong>
            <p>{userAnalytics?.stats?.googleAuthUsers || 0}</p>
          </div>
          <div className="stat-box">
            <strong>Admin Users</strong>
            <p>{userAnalytics?.stats?.adminUsers || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
