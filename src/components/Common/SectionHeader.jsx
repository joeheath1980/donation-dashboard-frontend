import React from 'react';
import cls from './SectionHeader.module.css';

function SectionHeader({
  eyebrow,
  title,
  subhead,
  variant = 'dark',
  icon = null,
  as: Heading = 'h2',
  trim = false,
  id,
  className = ''
}) {
  const wrapperClasses = [cls.wrapper, variant === 'dark' ? cls.dark : cls.light, className]
    .filter(Boolean)
    .join(' ');

  const containerProps = {
    className: trim ? `${cls.trimBand} ${wrapperClasses}` : wrapperClasses,
    role: 'group',
    id
  };

  return (
    <header {...containerProps}>
      {(eyebrow || icon) && (
        <div className={cls.row}>
          {icon && <span aria-hidden className={cls.icon}>{icon}</span>}
          {eyebrow && <span className={cls.eyebrow}>{eyebrow}</span>}
        </div>
      )}
      <Heading className={cls.title}>{title}</Heading>
      <div className={`${cls.accent} ${cls.interactive}`} />
      {subhead && <p className={cls.subhead}>{subhead}</p>}
    </header>
  );
}

export default SectionHeader;

