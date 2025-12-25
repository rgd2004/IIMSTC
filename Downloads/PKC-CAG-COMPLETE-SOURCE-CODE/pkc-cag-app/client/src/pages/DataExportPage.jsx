// client/src/pages/DataExportPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import Toast from 'react-hot-toast';
import '../pages/DataExportPage.css';

const DataExportPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('request');
  const [loading, setLoading] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);
  const [selectedData, setSelectedData] = useState({
    orders: true,
    reviews: true,
    referrals: true,
  });
  const [exportType, setExportType] = useState('json');
  const [scheduleData, setScheduleData] = useState({
    frequency: 'monthly',
    dataIncluded: ['orders', 'reviews'],
  });

  useEffect(() => {
    if (activeTab === 'history') {
      fetchExportHistory();
    }
  }, [activeTab]);

  const fetchExportHistory = async () => {
    try {
      setLoading(true);
      const response = await API.get('/export/history');
      setExportHistory(response.data.data);
    } catch (error) {
      Toast.error('Failed to fetch export history');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const dataIncluded = Object.keys(selectedData).filter((key) => selectedData[key]);

      const response = await API.post('/export/request', {
        exportType,
        dataIncluded,
      });

      if (response.data.success) {
        Toast.success('Export request submitted! Check email when ready.');
        setSelectedData({ orders: true, reviews: true, referrals: true });
      }
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to request export');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleExport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await API.post('/export/schedule', scheduleData);

      if (response.data.success) {
        Toast.success(`Scheduled ${scheduleData.frequency} exports set!`);
        setScheduleData({
          frequency: 'monthly',
          dataIncluded: ['orders', 'reviews'],
        });
      }
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to schedule export');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (exportId, fileName) => {
    try {
      Toast.loading('Downloading...');
      // In production, implement actual file download from server
      Toast.dismiss();
      Toast.success(`Download started: ${fileName}`);
    } catch (error) {
      Toast.error('Download failed');
    }
  };

  return (
    <div className="data-export-page">
      <div className="export-container">
        <h1>📊 Data Export & GDPR</h1>
        <p className="subtitle">Download your account data in various formats</p>

        <div className="export-tabs">
          <button
            className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
            onClick={() => setActiveTab('request')}
          >
            📥 Request Export
          </button>
          <button
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            ⏰ Scheduled Exports
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 Export History
          </button>
        </div>

        {/* REQUEST EXPORT TAB */}
        {activeTab === 'request' && (
          <div className="export-section">
            <form onSubmit={handleRequestExport} className="export-form">
              <div className="form-group">
                <label>📄 Export Format</label>
                <div className="format-options">
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="json"
                      checked={exportType === 'json'}
                      onChange={(e) => setExportType(e.target.value)}
                    />
                    <span>JSON (Structured data)</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportType === 'csv'}
                      onChange={(e) => setExportType(e.target.value)}
                    />
                    <span>CSV (Spreadsheet)</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      value="pdf"
                      checked={exportType === 'pdf'}
                      onChange={(e) => setExportType(e.target.value)}
                    />
                    <span>PDF (Document)</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>📋 Include in Export</label>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={selectedData.orders}
                      onChange={(e) =>
                        setSelectedData({ ...selectedData, orders: e.target.checked })
                      }
                    />
                    <span>✓ Orders History</span>
                  </label>
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={selectedData.reviews}
                      onChange={(e) =>
                        setSelectedData({ ...selectedData, reviews: e.target.checked })
                      }
                    />
                    <span>⭐ My Reviews</span>
                  </label>
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={selectedData.referrals}
                      onChange={(e) =>
                        setSelectedData({ ...selectedData, referrals: e.target.checked })
                      }
                    />
                    <span>👥 Referral Data</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Processing...' : '📥 Request Export'}
              </button>

              <div className="info-box">
                <p>📧 You'll receive an email with download link when export is ready (usually within 5 minutes)</p>
                <p>⏱️ Links expire after 7 days</p>
              </div>
            </form>
          </div>
        )}

        {/* SCHEDULE EXPORT TAB */}
        {activeTab === 'schedule' && (
          <div className="export-section">
            <form onSubmit={handleScheduleExport} className="export-form">
              <div className="form-group">
                <label>⏰ Frequency</label>
                <select
                  value={scheduleData.frequency}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, frequency: e.target.value })
                  }
                  className="form-control"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div className="form-group">
                <label>📋 Include in Each Export</label>
                <div className="checkbox-group">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={scheduleData.dataIncluded.includes('orders')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setScheduleData({
                            ...scheduleData,
                            dataIncluded: [...scheduleData.dataIncluded, 'orders'],
                          });
                        } else {
                          setScheduleData({
                            ...scheduleData,
                            dataIncluded: scheduleData.dataIncluded.filter((d) => d !== 'orders'),
                          });
                        }
                      }}
                    />
                    <span>✓ Orders History</span>
                  </label>
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={scheduleData.dataIncluded.includes('reviews')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setScheduleData({
                            ...scheduleData,
                            dataIncluded: [...scheduleData.dataIncluded, 'reviews'],
                          });
                        } else {
                          setScheduleData({
                            ...scheduleData,
                            dataIncluded: scheduleData.dataIncluded.filter((d) => d !== 'reviews'),
                          });
                        }
                      }}
                    />
                    <span>⭐ My Reviews</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Setting up...' : '⏰ Setup Scheduled Export'}
              </button>

              <div className="info-box">
                <p>📅 Exports will be sent to your email automatically</p>
                <p>🔄 Based on your selected frequency</p>
              </div>
            </form>
          </div>
        )}

        {/* EXPORT HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="export-section">
            {loading ? (
              <div className="loading">⏳ Loading export history...</div>
            ) : exportHistory.length === 0 ? (
              <div className="empty-state">
                <p>📭 No exports yet</p>
                <button
                  className="btn-link"
                  onClick={() => setActiveTab('request')}
                >
                  Request your first export →
                </button>
              </div>
            ) : (
              <div className="export-history-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Format</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exportHistory.map((exp) => (
                      <tr key={exp._id}>
                        <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className="badge">
                            {exp.exportType.toUpperCase()}
                          </span>
                        </td>
                        <td>{(exp.fileSize / 1024).toFixed(2)} KB</td>
                        <td>
                          <span
                            className={`status-badge ${exp.status}`}
                          >
                            {exp.status === 'completed' && '✅'}
                            {exp.status === 'pending' && '⏳'}
                            {exp.status === 'failed' && '❌'}
                            {' ' + exp.status}
                          </span>
                        </td>
                        <td>
                          {exp.status === 'completed' && (
                            <button
                              className="btn-small"
                              onClick={() =>
                                handleDownload(exp._id, exp.fileName)
                              }
                            >
                              📥 Download
                            </button>
                          )}
                          {exp.status === 'pending' && <span>⏳ Processing...</span>}
                          {exp.status === 'failed' && <span>❌ Error</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExportPage;
