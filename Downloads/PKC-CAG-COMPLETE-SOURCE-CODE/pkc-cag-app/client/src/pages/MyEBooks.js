import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API from '../utils/api';
import './MyEBooks.css';

const MyEBooks = () => {
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await API.get('/ebooks/my-ebooks');
      setEbooks(res.data.ebooks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const download = async (id, title) => {
    try {
      const res = await API.get(
        `/ebooks/purchase/${id}/download`,
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="my-ebooks-container">
      <h1>📚 My E-Books</h1>

      {ebooks.map(e => (
        <div key={e._id}>
          <h3>{e.ebook.title}</h3>
          <button onClick={() => download(e._id, e.ebook.title)}>
            Download
          </button>
        </div>
      ))}
    </div>
  );
};

export default MyEBooks;
