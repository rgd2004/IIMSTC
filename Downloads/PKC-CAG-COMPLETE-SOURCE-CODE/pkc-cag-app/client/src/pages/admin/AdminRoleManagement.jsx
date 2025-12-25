// client/src/pages/admin/AdminRoleManagement.jsx
import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminRoleManagement.css';

const AdminRoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modules: [],
  });

  const [assignData, setAssignData] = useState({
    userId: '',
    role: '',
  });

  const availableModules = [
    'dashboard',
    'users',
    'orders',
    'services',
    'analytics',
    'coupons',
    'reviews',
    'referrals',
    'withdrawals',
    'support-tickets',
    'reports',
    'settings',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [rolesRes, adminsRes] = await Promise.all([
        API.get('/admin-enhanced/roles'),
        API.get('/admin-enhanced/users'),
      ]);

      setRoles(rolesRes.data.data);
      setAdmins(adminsRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        modules: checked
          ? [...prev.modules, value]
          : prev.modules.filter((m) => m !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const permissions = formData.modules.map((module) => `manage_${module}`);

      await API.post(
        '/admin-enhanced/roles/create',
        {
          ...formData,
          permissions,
        }
      );

      toast.success('Role created successfully');
      setFormData({ name: '', description: '', modules: [] });
      setShowForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create role');
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    try {
      await API.post(
        '/admin-enhanced/users/assign-role',
        assignData
      );

      toast.success('Role assigned successfully');
      setAssignData({ userId: '', role: '' });
      setShowAssignRole(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign role');
    }
  };

  if (loading) return <div className="admin-role-management">Loading...</div>;

  return (
    <div className="admin-role-management">
      <h1>👥 Admin Role Management</h1>

      <div className="management-tabs">
        <div className="tab-buttons">
          <button className="tab-btn active">Roles</button>
          <button className="tab-btn">Admin Users</button>
        </div>

        {/* Roles Tab */}
        <div className="tab-content">
          <div className="tab-header">
            <h2>Roles</h2>
            <button className="btn-create" onClick={() => setShowForm(!showForm)}>
              ➕ Create Role
            </button>
          </div>

          {showForm && (
            <div className="role-form">
              <form onSubmit={handleCreateRole}>
                <div className="form-group">
                  <label>Role Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Support Agent"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Role description..."
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Modules Access *</label>
                  <div className="modules-grid">
                    {availableModules.map((module) => (
                      <label key={module} className="checkbox-item">
                        <input
                          type="checkbox"
                          value={module}
                          checked={formData.modules.includes(module)}
                          onChange={handleInputChange}
                        />
                        {module.replace('-', ' ').toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-submit">
                    Create Role
                  </button>
                  <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <table className="roles-table">
            <thead>
              <tr>
                <th>Role Name</th>
                <th>Description</th>
                <th>Modules</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role._id}>
                  <td><strong>{role.name}</strong></td>
                  <td>{role.description || '-'}</td>
                  <td>
                    <div className="modules-list">
                      {role.modules.slice(0, 3).map((m) => (
                        <span key={m} className="module-badge">
                          {m}
                        </span>
                      ))}
                      {role.modules.length > 3 && (
                        <span className="module-badge">+{role.modules.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="status-active">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Users Section */}
      <div className="admin-users-section">
        <div className="section-header">
          <h2>Admin Users</h2>
          <button className="btn-assign" onClick={() => setShowAssignRole(!showAssignRole)}>
            👤 Assign Role
          </button>
        </div>

        {showAssignRole && (
          <div className="assign-role-form">
            <form onSubmit={handleAssignRole}>
              <div className="form-row">
                <div className="form-group">
                  <label>Admin User *</label>
                  <select
                    name="userId"
                    value={assignData.userId}
                    onChange={(e) => setAssignData({ ...assignData, userId: e.target.value })}
                    required
                  >
                    <option value="">Select Admin</option>
                    {admins.map((admin) => (
                      <option key={admin._id} value={admin._id}>
                        {admin.name} ({admin.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    name="role"
                    value={assignData.role}
                    onChange={(e) => setAssignData({ ...assignData, role: e.target.value })}
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role.name}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn-submit">
                  Assign
                </button>
              </div>
            </form>
          </div>
        )}

        <table className="admins-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id}>
                <td><strong>{admin.name}</strong></td>
                <td>{admin.email}</td>
                <td>
                  {admin.adminRole ? (
                    <span className="role-badge">{admin.adminRole}</span>
                  ) : (
                    <span className="role-badge gray">Unassigned</span>
                  )}
                </td>
                <td>
                  <span className={admin.isActive ? 'status-active' : 'status-inactive'}>
                    {admin.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminRoleManagement;
