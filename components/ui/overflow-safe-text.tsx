import React from 'react';

interface OverflowSafeTextProps {
  children: React.ReactNode;
  className?: string;
  showTooltip?: boolean;
  title?: string;
}

export function OverflowSafeText({ 
  children, 
  className = "", 
  showTooltip = true,
  title
}: OverflowSafeTextProps) {
  const textContent = typeof children === 'string' ? children : '';
  
  return (
    <div 
      className={`${className} overflow-hidden`}
      title={showTooltip ? (title || textContent) : undefined}
      style={{
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        minWidth: 0,
        maxWidth: '100%',
        wordBreak: 'break-word'
      }}
    >
      {children}
    </div>
  );
}
