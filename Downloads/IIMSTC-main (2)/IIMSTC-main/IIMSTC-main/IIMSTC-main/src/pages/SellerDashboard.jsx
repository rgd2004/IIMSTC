import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';

export default function SellerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'crafts',
    images: []
  });

  // Redirect if not a seller
  useEffect(() => {
    if (user && user.role !== 'seller') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch seller products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setProducts(result.products);
      } else {
        setError(result.message || 'Failed to load products');
      }
    } catch (err) {
      setError('Error loading products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/seller/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setProducts([...products, result.product]);
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: 'crafts',
          images: []
        });
        setShowAddProduct(false);
      } else {
        setError(result.message || 'Failed to add product');
      }
    } catch (err) {
      setError('Error adding product');
      console.error(err);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setProducts(products.map(p => p.id === editingProduct.id ? result.product : p));
        setEditingProduct(null);
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: 'crafts',
          images: []
        });
      } else {
        setError(result.message || 'Failed to update product');
      }
    } catch (err) {
      setError('Error updating product');
      console.error(err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/seller/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        setProducts(products.filter(p => p.id !== productId));
      } else {
        setError(result.message || 'Failed to delete product');
      }
    } catch (err) {
      setError('Error deleting product');
      console.error(err);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      images: product.images
    });
    setShowAddProduct(true);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setShowAddProduct(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: 'crafts',
      images: []
    });
  };

  if (!user || user.role !== 'seller') {
    return null;
  }

  return (
    <div className="seller-dashboard" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Seller Dashboard</h1>
        <button
          onClick={() => setShowAddProduct(true)}
          style={{
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600'
          }}
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '8px',
          color: '#dc2626',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
        }}>
          <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Products</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{products.length}</div>
        </div>
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
        }}>
          <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Stock</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>{products.reduce((sum, p) => sum + p.stock, 0)}</div>
        </div>
        <div style={{
          background: '#fff',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
        }}>
          <div style={{ color: '#666', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Value</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>₹{(products.reduce((sum, p) => sum + (p.price * p.stock), 0)).toLocaleString()}</div>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {showAddProduct && (
        <div style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                style={{ width: '100%', minHeight: '100px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
                style={{ width: '100%' }}
              >
                <option value="crafts">Handmade Crafts</option>
                <option value="textiles">Textiles & Fabrics</option>
                <option value="jewelry">Jewelry & Accessories</option>
                <option value="pottery">Pottery & Ceramics</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  background: '#f0f0f0',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        overflow: 'hidden'
      }}>
        <h2 style={{ padding: '1.5rem', borderBottom: '1px solid #e0e0e0', margin: 0 }}>Your Products</h2>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No products yet. Click "Add New Product" to get started!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9f9f9', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Product Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Price</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Stock</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '1rem' }}>{product.name}</td>
                    <td style={{ padding: '1rem' }}>₹{product.price}</td>
                    <td style={{ padding: '1rem' }}>{product.stock}</td>
                    <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{product.category}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: product.status === 'approved' ? '#d4edda' : product.status === 'pending' ? '#fff3cd' : '#f8d7da',
                        color: product.status === 'approved' ? '#155724' : product.status === 'pending' ? '#856404' : '#721c24',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {product.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditProduct(product)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#667eea',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Edit product"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
