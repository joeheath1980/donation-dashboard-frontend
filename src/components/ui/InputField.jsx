import React from 'react';
import styles from './InputField.module.css';

/**
 * Standardized input with label, hint, and error message.
 */
const InputField = ({
  label,
  hint,
  error,
  required = false,
  type = 'text',
  as,
  after,
  children,
  className,
  inputClassName,
  ...rest
}) => {
  let InputComponent = 'input';
  if (as === 'textarea') InputComponent = 'textarea';
  if (as === 'select') InputComponent = 'select';

  const isTextInput = InputComponent === 'input';

  return (
    <label className={`${styles.field} ${className || ''}`}>
      {label && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          {required && <span className={styles.required}>*</span>}
        </div>
      )}
      <div className={`${styles.control} ${after ? styles.hasAfter : ''}`}>
        <InputComponent
          className={`${styles.input} ${error ? styles.error : ''} ${inputClassName || ''}`}
          type={isTextInput ? type : undefined}
          {...rest}
        >
          {InputComponent === 'select' ? children : null}
        </InputComponent>
        {after && <div className={styles.after}>{after}</div>}
      </div>
      {hint && !error && <div className={styles.hint}>{hint}</div>}
      {error && <div className={styles.errorText}>{error}</div>}
    </label>
  );
};

export default InputField;
