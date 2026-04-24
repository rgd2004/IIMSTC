import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

const ADMIN_EMAIL = 'ammanurraj@gmail.com';
const ADMIN_PASSWORD = 'iimstc@4431';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    if (email === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        const adminUser = { name: 'Admin', email, role: 'admin' };
        setUser(adminUser);
        return adminUser;
      }
      return null;
    }

    const regularUser = { name: 'User', email, role: 'user' };
    setUser(regularUser);
    return regularUser;
  };

  const signup = (name, email, password, phone) => {
    const newUser = { name, email, phone, role: 'user' };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
