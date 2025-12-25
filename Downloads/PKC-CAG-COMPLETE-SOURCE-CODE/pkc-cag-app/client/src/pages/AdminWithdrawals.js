import React, { useEffect, useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";

const AdminWithdrawals = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get("/admin/users").then((res) => {
      setUsers(res.data.users);
    });
  }, []);

  const handleAction = (userId, reqId, action) => {
    API.put(`/referral/${action}/${userId}/${reqId}`).then((res) => {
      toast.success(res.data.message);
    });
  };

  return (
    <div className="admin-withdrawals">
      <h1>Withdrawal Requests</h1>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>UPI</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) =>
            user.withdrawalRequests?.map((w) => (
              <tr key={w._id}>
                <td>{user.name}</td>
                <td>{w.upiId}</td>
                <td>₹{w.amount}</td>
                <td>{w.status}</td>
                <td>
                  <button onClick={() => handleAction(user._id, w._id, "approve")}>
                    Approve
                  </button>
                  <button onClick={() => handleAction(user._id, w._id, "decline")}>
                    Decline
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminWithdrawals;
