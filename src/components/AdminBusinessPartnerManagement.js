import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBusinessPartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axios.get('/api/admin/business-partners');
        setPartners(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch business partners');
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handleStatusChange = async (partnerId, newStatus) => {
    try {
      await axios.put(`/api/admin/business-partners/${partnerId}/status`, { status: newStatus });
      setPartners(partners.map(partner => 
        partner._id === partnerId ? { ...partner, status: newStatus } : partner
      ));
    } catch (err) {
      setError('Failed to update business partner status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Business Partner Management</h2>
      <table>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Join Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map(partner => (
            <tr key={partner._id}>
              <td>{partner.companyName}</td>
              <td>{partner.contactPerson}</td>
              <td>{partner.email}</td>
              <td>{new Date(partner.joinDate).toLocaleDateString()}</td>
              <td>
                <select 
                  value={partner.status} 
                  onChange={(e) => handleStatusChange(partner._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </td>
              <td>
                {/* Add more actions here */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBusinessPartnerManagement;