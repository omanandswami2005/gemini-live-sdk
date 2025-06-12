import React, { useRef, useEffect } from 'react';

export function AudioVisualizer({ 
  volumeLevel, 
  className = '',
  color = '#3b82f6',
  backgroundColor = '#e5e7eb'
}) {
  const progressRef = useRef(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.value = volumeLevel;
    }
  }, [volumeLevel]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Volume:</span>
      <progress
        ref={progressRef}
        max="100"
        value={volumeLevel}
        className="w-32 h-2 rounded-lg overflow-hidden"
        style={{
          accentColor: color,
          backgroundColor: backgroundColor
        }}
      />
      <span className="text-sm text-gray-500 min-w-[3rem]">
        {Math.round(volumeLevel)}%
      </span>
    </div>
  );
}