import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get('/api/admin/donations');
        setDonations(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch donations');
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  const handleStatusChange = async (donationId, newStatus) => {
    try {
      await axios.put(`/api/admin/donations/${donationId}/status`, { status: newStatus });
      setDonations(donations.map(donation => 
        donation._id === donationId ? { ...donation, status: newStatus } : donation
      ));
    } catch (err) {
      setError('Failed to update donation status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Donation Management</h2>
      <table>
        <thead>
          <tr>
            <th>Donor</th>
            <th>Amount</th>
            <th>Charity</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {donations.map(donation => (
            <tr key={donation._id}>
              <td>{donation.donor.name}</td>
              <td>${donation.amount.toFixed(2)}</td>
              <td>{donation.charity.name}</td>
              <td>{new Date(donation.date).toLocaleDateString()}</td>
              <td>
                <select 
                  value={donation.status} 
                  onChange={(e) => handleStatusChange(donation._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
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

export default AdminDonationManagement;