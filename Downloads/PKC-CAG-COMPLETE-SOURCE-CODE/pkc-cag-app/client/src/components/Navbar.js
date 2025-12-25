// client/src/components/Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTimes, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar upgraded-navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={closeMenu}>
          <div className="logo-text">PKC CAG</div>
        </Link>

        <div className="nav-icons">
          <a href="https://wa.me/919481513621" target="_blank" rel="noreferrer">
            <FaWhatsapp />
          </a>
          <a href="mailto:pkccag@gmail.com">
            <FaEnvelope />
          </a>
        </div>

        <div className="hamburger" onClick={toggleMenu}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <li><Link to="/services" onClick={closeMenu}>Services</Link></li>
          
          {/* Show E-Books and Job Assistance only for logged-in non-admin users */}
          {user && !user?.isAdmin && (
            <>
              <li><Link to="/ebooks-hub" onClick={closeMenu}>📚 E-Books</Link></li>
              <li><Link to="/job-assistant-hub" onClick={closeMenu}>💼 Job Assistance</Link></li>
            </>
          )}

          {/* Show Dashboard & Profile only for logged-in non-admin users */}
          {user && !user?.isAdmin && (
            <>
              <li><Link to="/dashboard" onClick={closeMenu}>Dashboard</Link></li>
              <li><Link to="/profile" onClick={closeMenu}>Profile</Link></li>
            </>
          )}

          {/* Show "More" menu only for non-admin users */}
          {!user?.isAdmin && (
            <li className="dropdown">
              <span>More ▾</span>
              <ul className="dropdown-menu">
                <li><Link to="/reviews" onClick={closeMenu}>Reviews</Link></li>
                <li><Link to="/terms" onClick={closeMenu}>Terms</Link></li>
              </ul>
            </li>
          )}

          {/* ===================== AUTH SECTION ===================== */}
          {user ? (
            <>
              {/* Show USER HUB (Consolidated Dashboard) only for non-admin users */}
              {!user.isAdmin && (
                <>
                  <li><Link to="/user-hub" onClick={closeMenu}>🎯 User Hub</Link></li>
                </>
              )}

              {/* ⭐ ADMIN MENU (Visible only for Admins) */}
              {user.isAdmin && (
                <li>
                  <Link to="/admin" onClick={closeMenu}>
                    <i className="fas fa-crown"></i> Admin Panel
                  </Link>
                </li>
              )}

              <li>
                <button
                  className="btn-logout"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link className="btn-secondary" to="/login" onClick={closeMenu}>Login</Link></li>
              <li><Link className="btn-primary" to="/register" onClick={closeMenu}>Get Started</Link></li>
              
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
