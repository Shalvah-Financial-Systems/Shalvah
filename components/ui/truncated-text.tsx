import React from 'react';

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  showTooltip?: boolean;
}

export function TruncatedText({ 
  text, 
  maxLength = 30, 
  className = "", 
  showTooltip = true 
}: TruncatedTextProps) {
  const shouldTruncate = text.length > maxLength;
  
  return (
    <div 
      className={`${className} ${shouldTruncate ? 'cursor-help' : ''} truncate max-w-full`}
      title={showTooltip && shouldTruncate ? text : undefined}
    >
      {text}
    </div>
  );
}
