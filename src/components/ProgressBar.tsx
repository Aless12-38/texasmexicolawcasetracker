import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="relative h-4 bg-neutral-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
        style={{ width: `${clampedProgress}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
        {clampedProgress}%
      </div>
    </div>
  );
}

export default ProgressBar;