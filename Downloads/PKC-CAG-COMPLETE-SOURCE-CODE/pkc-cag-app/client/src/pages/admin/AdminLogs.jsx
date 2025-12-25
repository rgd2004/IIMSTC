import React, { useEffect, useState, useMemo } from 'react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminLogs.css';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [filterResource, setFilterResource] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getLogs();
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs', err);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  // Get unique actions and resources for filter dropdowns
  const uniqueActions = useMemo(
    () => [...new Set(logs.map(l => l.action).filter(Boolean))],
    [logs]
  );
  const uniqueResources = useMemo(
    () => [...new Set(logs.map(l => l.resourceType).filter(Boolean))],
    [logs]
  );

  // Filter logs based on criteria
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const matchesResource = filterResource === 'all' || log.resourceType === filterResource;
      const matchesSearch =
        searchTerm === '' ||
        (log.actorEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.adminName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.action || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesAction && matchesResource && matchesSearch;
    });
  }, [logs, filterAction, filterResource, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredLogs.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalLogs = logs.length;
    const successCount = logs.filter(l => l.status === 'success').length;
    const failedCount = logs.filter(l => l.status === 'failed').length;
    const uniqueAdmins = new Set(logs.map(l => l.adminName || l.actorEmail).filter(Boolean)).size;

    return { totalLogs, successCount, failedCount, uniqueAdmins };
  }, [logs]);

  // Get action type for badge styling
  const getActionClass = (action) => {
    if (!action) return 'action-view';
    const lower = action.toLowerCase();
    if (lower.includes('creat')) return 'action-create';
    if (lower.includes('updat')) return 'action-update';
    if (lower.includes('delet')) return 'action-delete';
    if (lower.includes('view') || lower.includes('fetch')) return 'action-view';
    return 'action-view';
  };

  // Format timestamp
  const formatTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return (name || 'A')
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="admin-logs-page">
        <div className="loading-screen">
          <div className="loader-spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-logs-page">
      {/* Header */}
      <div className="page-header">
        <h1>🔍 Audit Logs</h1>
        <p>Complete system activity and admin action history</p>
      </div>

      {/* Stats Cards */}
      <div className="logs-stats">
        <div className="stat-card">
          <div className="stat-label">Total Logs</div>
          <div className="stat-value">{stats.totalLogs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Success</div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {stats.successCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Failed</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {stats.failedCount}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Admins</div>
          <div className="stat-value">{stats.uniqueAdmins}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="logs-filters">
        <div className="filter-group">
          <label>Search By Admin</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Email or name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <label>Filter By Action</label>
          <select
            className="filter-select"
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Filter By Resource</label>
          <select
            className="filter-select"
            value={filterResource}
            onChange={(e) => {
              setFilterResource(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Resources</option>
            {uniqueResources.map(resource => (
              <option key={resource} value={resource}>
                {resource}
              </option>
            ))}
          </select>
        </div>

        <button
          className="filter-button"
          onClick={() => {
            setFilterAction('all');
            setFilterResource('all');
            setSearchTerm('');
            setPage(1);
          }}
        >
          Reset Filters
        </button>
      </div>

      {/* Logs Table */}
      {paginatedLogs.length > 0 ? (
        <div className="logs-container">
          <div className="logs-table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Status</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map(log => (
                  <tr key={log._id}>
                    <td>
                      <span className="log-timestamp">{formatTime(log.createdAt)}</span>
                    </td>

                    <td>
                      <div className="log-actor">
                        <div className="actor-avatar">{getInitials(log.adminName || log.actorEmail)}</div>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                            {log.adminName || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                            {log.actorEmail || '-'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`action-badge ${getActionClass(log.action)}`}>
                        {log.action || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span className="resource-type">{log.resourceType || 'N/A'}</span>
                        {log.resourceId && (
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                            ID: {log.resourceId.slice(-8)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          log.status === 'success' ? 'status-success' : 'status-failed'
                        }`}
                      >
                        {log.status === 'success' ? '✓ Success' : '✗ Failed'}
                      </span>
                    </td>

                    <td>
                      <span
                        className="log-details"
                        title={log.description || JSON.stringify(log.details || {})}
                      >
                        {log.description ||
                          (log.details
                            ? `${Object.keys(log.details).length} change(s)`
                            : 'No details')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="logs-pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>

              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>

              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="logs-container">
          <div className="logs-empty">
            <div className="logs-empty-icon">📭</div>
            <p>No audit logs found matching your filters</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
