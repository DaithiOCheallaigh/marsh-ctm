import React from 'react';
import { getCapacityColor, getCapacityColorClasses } from './WorkloadInput';

interface CapacityBarProps {
  workload: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const CapacityBar: React.FC<CapacityBarProps> = ({
  workload,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const availableCapacity = 100 - workload;
  const capacityColor = getCapacityColor(availableCapacity);
  const colorClasses = getCapacityColorClasses(capacityColor);

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  // 10-dot visualization
  const renderDots = () => {
    const dots = [];
    const totalDots = 10;
    const filledDots = Math.ceil(workload / 10);
    
    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-3 h-3',
    };

    for (let i = 0; i < totalDots; i++) {
      const isFilled = i < filledDots;
      dots.push(
        <div
          key={i}
          className={`${dotSizes[size]} rounded-full transition-all ${
            isFilled ? colorClasses.bar : 'bg-[hsl(var(--wq-bg-muted))]'
          }`}
        />
      );
    }
    return dots;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {renderDots()}
      </div>
      {showLabel && (
        <span className={`text-xs font-medium ${colorClasses.text}`}>
          {workload}%
        </span>
      )}
    </div>
  );
};

// Inline capacity display for member cards
interface InlineCapacityProps {
  currentWorkload: number;
  projectedWorkload?: number;
  showProjected?: boolean;
}

export const InlineCapacity: React.FC<InlineCapacityProps> = ({
  currentWorkload,
  projectedWorkload,
  showProjected = false,
}) => {
  const availableCapacity = 100 - currentWorkload;
  const capacityColor = getCapacityColor(availableCapacity);
  const colorClasses = getCapacityColorClasses(capacityColor);

  const projectedAvailable = projectedWorkload !== undefined ? 100 - projectedWorkload : availableCapacity;
  const projectedColor = getCapacityColor(projectedAvailable);
  const projectedColorClasses = getCapacityColorClasses(projectedColor);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[hsl(var(--wq-text-muted))]">Workload:</span>
      {showProjected && projectedWorkload !== undefined ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[hsl(var(--wq-text-muted))] line-through">{currentWorkload}%</span>
          <span className="text-[hsl(var(--wq-text-secondary))]">→</span>
          <span className={`text-xs font-medium ${projectedColorClasses.text}`}>
            {projectedWorkload}%
          </span>
        </div>
      ) : (
        <span className={`text-xs font-medium ${colorClasses.text}`}>{currentWorkload}%</span>
      )}
      <span className="text-xs text-[hsl(var(--wq-text-muted))]">|</span>
      <span className="text-xs text-[hsl(var(--wq-text-muted))]">Available:</span>
      {showProjected && projectedWorkload !== undefined ? (
        <span className={`text-xs font-medium ${projectedColorClasses.text}`}>
          {projectedAvailable}%
        </span>
      ) : (
        <span className={`text-xs font-medium ${colorClasses.text}`}>{availableCapacity}%</span>
      )}
    </div>
  );
};

export default CapacityBar;
