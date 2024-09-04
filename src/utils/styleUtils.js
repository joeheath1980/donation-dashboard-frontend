// src/utils/styleUtils.js

export const applyGlobalStyles = (localStyles, globalClasses) => {
  const combinedStyles = {};
  for (const [key, value] of Object.entries(localStyles)) {
    combinedStyles[key] = `${value} ${globalClasses[key] || ''}`.trim();
  }
  return combinedStyles;
};

export const globalClasses = {
  container: 'container',
  card: 'card',
  header: 'h1',
  subheader: 'h2',
  paragraph: 'p',
  button: 'btn',
  primaryButton: 'btn btn-primary',
  secondaryButton: 'btn btn-secondary',
  input: 'form-input',
  label: 'form-label',
  error: 'form-error',
};