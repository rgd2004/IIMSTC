import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../utils/api';
import '../styles/EBookHub.css';

const MyLibrary = () => {
  const navigate = useNavigate();
  const [myEbooks, setMyEbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchMyEbooks();
  }, []);

  const fetchMyEbooks = async () => {
    try {
      setLoading(true);

      const res = await API.get('/ebooks/my-ebooks');
      setMyEbooks(res.data.ebooks || []);
    } catch (err) {
      console.error('❌ Error fetching library:', err);
      alert('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchaseId, title = 'ebook') => {
    try {
      const res = await API.get(
        `/ebooks/purchase/${purchaseId}/download`,
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('❌ Download failed:', err);
      alert('Download failed');
    }
  };

  const filtered = myEbooks.filter(item => {
    if (!item.ebook) return false;
    const t = item.ebook.title.toLowerCase();
    return t.includes(searchTerm.toLowerCase()) &&
      (filterCategory === 'all' || item.ebook.category === filterCategory);
  });

  return (
    <div className="ebook-hub-container">
      <h1>📖 My Library</h1>

      <input
        placeholder="Search…"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <p>Loading…</p>
      ) : (
        filtered.map(item => (
          <div key={item._id}>
            <h3>{item.ebook.title}</h3>
            <button
              onClick={() => handleDownload(item._id, item.ebook.title)}
            >
              Download
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyLibrary;
