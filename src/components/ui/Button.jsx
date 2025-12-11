import React from 'react';
import styles from './Button.module.css';

const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Theme-aware button with variants and full width support.
 * Uses CSS variables defined in do-nation-theme.css.
 */
const Button = ({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className,
  ...rest
}) => {
  return (
    <Component
      className={cx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
      {...rest}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{children}</span>
    </Component>
  );
};

export default Button;
