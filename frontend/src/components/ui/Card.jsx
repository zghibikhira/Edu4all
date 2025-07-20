import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  shadow = 'shadow-sm',
  border = 'border',
  hover = false,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg';
  const classes = `${baseClasses} ${padding} ${shadow} ${border} ${hover ? 'hover:shadow-md transition-shadow' : ''} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card; 