/**
 * Form validation helper functions
 */

export const validators = {
  required: (value, fieldName = 'This field') => {
    if (value === undefined || value === null || String(value).trim() === '') {
      return `${fieldName} is required.`;
    }
    return '';
  },

  email: (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address.';
    }
    return '';
  },

  phone: (value) => {
    if (!value) return '';
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number.';
    }
    return '';
  },

  minLength: (value, min, fieldName = 'This field') => {
    if (!value) return '';
    if (String(value).trim().length < min) {
      return `${fieldName} must be at least ${min} characters.`;
    }
    return '';
  },

  isPositiveNumber: (value, fieldName = 'Amount') => {
    if (value === '' || value === undefined || value === null) return '';
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return `${fieldName} must be a positive number.`;
    }
    return '';
  },
};
