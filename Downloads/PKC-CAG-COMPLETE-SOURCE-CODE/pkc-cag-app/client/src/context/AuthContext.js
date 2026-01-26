import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL =
	process.env.REACT_APP_API_URL || "/api";

  // Fetch logged-in user
  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const res = await axios.get("/auth/me");
      console.log('✅ User fetched from /auth/me:', res.data.user);
      setUser(res.data.user);
    } catch (err) {
      console.error('⚠️ Failed to fetch user from /auth/me. Trying localStorage...', err.message);
      // Try to restore from localStorage as fallback
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('✅ User restored from localStorage:', userData);
          setUser(userData);
        } catch (parseErr) {
          console.error('⚠️ Failed to parse saved user:', parseErr.message);
        }
      }
      // Don't clear token here - it might still be valid
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
    console.log('✅ User logged in and saved:', userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
