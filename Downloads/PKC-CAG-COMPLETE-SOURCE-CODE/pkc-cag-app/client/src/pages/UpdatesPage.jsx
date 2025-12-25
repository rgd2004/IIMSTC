import React, { useEffect, useState } from "react";
import axios from "../utils/api";

const UpdatesPage = () => {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    axios.get("/updates").then((res) => {
      setUpdates(res.data.updates);
    });
  }, []);

  return (
    <div className="updates-page">
      <h2>📢 Latest Updates</h2>

      {updates.map((u) => (
        <div key={u._id} className={`update-card ${u.type}`}>
          <h3>{u.title}</h3>
          <p>{u.message}</p>
          <small>{new Date(u.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default UpdatesPage;
