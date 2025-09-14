export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  return { valid: true, message: '' };
};

export const validatePassword = (password) => {
  const errors = [];
  let strength = 0;
  
  if (!password) {
    return { 
      valid: false, 
      message: 'Password is required',
      strength: 0,
      requirements: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      }
    };
  }
  
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  if (!requirements.length) {
    errors.push('at least 8 characters');
  } else {
    strength++;
  }
  
  if (!requirements.uppercase) {
    errors.push('one uppercase letter');
  } else {
    strength++;
  }
  
  if (!requirements.lowercase) {
    errors.push('one lowercase letter');
  } else {
    strength++;
  }
  
  if (!requirements.number) {
    errors.push('one number');
  } else {
    strength++;
  }
  
  // Special character is optional - adds to strength but not required
  if (requirements.special) {
    strength++;
  }

  // Valid if has length, uppercase, lowercase, and number (special is optional)
  const isValid = requirements.length && requirements.uppercase && requirements.lowercase && requirements.number;
  
  return {
    valid: isValid,
    message: errors.length > 0 ? `Password must contain ${errors.join(', ')}` : '',
    strength: Math.min(4, Math.floor((strength / 5) * 4)),
    requirements
  };
};

export const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case 0:
    case 1:
      return 'Weak';
    case 2:
      return 'Medium';
    case 3:
      return 'Strong';
    case 4:
      return 'Very Strong';
    default:
      return '';
  }
};

export const getPasswordStrengthColor = (strength) => {
  switch (strength) {
    case 0:
    case 1:
      return '#dc3545';
    case 2:
      return '#ffc107';
    case 3:
      return '#28a745';
    case 4:
      return '#007bff';
    default:
      return '#6c757d';
  }
};

export const validateName = (name) => {
  if (!name) {
    return { valid: false, message: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  
  if (name.trim().length > 100) {
    return { valid: false, message: 'Name must be less than 100 characters' };
  }
  
  return { valid: true, message: '' };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '')
    .trim();
};
