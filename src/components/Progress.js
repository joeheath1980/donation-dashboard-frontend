import React from 'react';

const Progress = ({ value }) => {
  return (
    <div className="progress-capsule">
      <div
        className="progress-capsule-inner"
        style={{
          width: `${value}%`,
        }}
      ></div>
    </div>
  );
};

export default Progress;

