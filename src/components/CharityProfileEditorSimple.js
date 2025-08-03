import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CharityProfileEditorSimple = () => {
  const navigate = useNavigate();
  const { charityId } = useParams();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Edit Charity Profile</h1>
      <p>Charity ID: {charityId}</p>
      <button onClick={() => navigate('/charity-dashboard')}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default CharityProfileEditorSimple;