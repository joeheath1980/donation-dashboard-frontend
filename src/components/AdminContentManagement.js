import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminContentManagement = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get('/api/admin/content');
        setContent(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch content');
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleStatusChange = async (contentId, newStatus) => {
    try {
      await axios.put(`/api/admin/content/${contentId}/status`, { status: newStatus });
      setContent(content.map(item => 
        item._id === contentId ? { ...item, status: newStatus } : item
      ));
    } catch (err) {
      setError('Failed to update content status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Content Management</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Author</th>
            <th>Created At</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {content.map(item => (
            <tr key={item._id}>
              <td>{item.title}</td>
              <td>{item.type}</td>
              <td>{item.author}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                <select 
                  value={item.status} 
                  onChange={(e) => handleStatusChange(item._id, e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </td>
              <td>
                {/* Add more actions here, like edit and delete */}
                <button onClick={() => console.log('Edit', item._id)}>Edit</button>
                <button onClick={() => console.log('Delete', item._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminContentManagement;