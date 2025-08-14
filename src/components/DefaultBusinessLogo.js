import React from 'react';

const DefaultBusinessLogo = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="border-rounded-6 bg-gradient-primary"
  >
    <rect width="32" height="32" fill="#f3f4f6" />
    <path
      d="M16 8C14.8954 8 14 8.89543 14 10V14H10C8.89543 14 8 14.8954 8 16V22C8 23.1046 8.89543 24 10 24H22C23.1046 24 24 23.1046 24 22V16C24 14.8954 23.1046 14 22 14H18V10C18 8.89543 17.1046 8 16 8Z"
      fill="#9ca3af"
    />
    <circle cx="16" cy="18" r="1.5" fill="#f3f4f6" />
  </svg>
);

export default DefaultBusinessLogo;