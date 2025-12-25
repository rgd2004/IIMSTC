import React, { useEffect, useState } from "react";
import { adminAPI } from "../../utils/api";
import toast from "react-hot-toast";
import "./AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to load users", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (user) => {
    setProcessingId(user._id);
    try {
      const res = await adminAPI.updateUser(user._id, { isActive: !user.isActive });
      toast.success(res.data.message || "User updated");
      setUsers((prev) => prev.map(u => u._id === user._id ? res.data.user : u));
    } catch (err) {
      console.error("Toggle active failed", err);
      toast.error(err?.response?.data?.message || "Failed to update user");
    } finally {
      setProcessingId(null);
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) return;
    setProcessingId(user._id);
    try {
      await adminAPI.deleteUser(user._id);
      toast.success("User deleted");
      setUsers((prev) => prev.filter(u => u._id !== user._id));
    } catch (err) {
      console.error("Delete user failed", err);
      toast.error(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="loading-screen">Loading users...</div>;

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage user accounts: suspend, reactivate or delete users.</p>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Admin</th>
              <th>Verified</th>
              <th>Active</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className={!u.isActive ? 'suspended' : ''}>
                <td>{u.name || '-'}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td>{u.isAdmin ? 'Yes' : 'No'}</td>
                <td>{u.isVerified ? 'Yes' : 'No'}</td>
                <td>{u.isActive ? 'Active' : 'Suspended'}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className={`btn ${u.isActive ? 'warn' : 'primary'}`}
                    disabled={processingId === u._id}
                    onClick={() => toggleActive(u)}
                  >
                    {processingId === u._id ? '...' : (u.isActive ? 'Suspend' : 'Reactivate')}
                  </button>

                  <button
                    className="btn danger"
                    disabled={processingId === u._id}
                    onClick={() => deleteUser(u)}
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
