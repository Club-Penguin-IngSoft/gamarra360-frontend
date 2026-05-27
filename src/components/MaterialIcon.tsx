import React from 'react';

interface MaterialIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
}

const MaterialIcon = ({
  name,
  className = '',
  style,
  onClick,
  title,
}: MaterialIconProps) => {
  return (
    <span
      className={`material-icons-round select-none ${className}`}
      style={{ userSelect: 'none', ...style }}
      onClick={onClick}
      title={title}
      aria-hidden={!title}
      aria-label={title}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
