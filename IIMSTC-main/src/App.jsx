import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ArtisanUpload from './pages/ArtisanUpload';
import ProductDetails from './pages/ProductDetails';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import AdminDashboard from './pages/AdminDashboard';
import RainbowCursor from './components/RainbowCursor';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <RainbowCursor />
          <Navbar />
          <main className="container wrapper" style={{ padding: '2rem 1.5rem', flex: 1, position: 'relative', zIndex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sell" element={<ArtisanUpload />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          
          <footer style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '2rem 1.5rem', alignText: 'center', marginTop: 'auto', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
              <p style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '0.5rem' }}>© 2026 Local Artisan Digital Marketplace.</p>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>Empowering rural craftspeople directly with Advanced 3D Technology.</p>
            </div>
          </footer>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
