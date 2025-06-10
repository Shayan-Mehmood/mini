import React from 'react';

interface CustomToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  label?: string;
  activeColor?: string;
  inactiveColor?: string;
}

const CustomToggleSwitch: React.FC<CustomToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className = '',
  id,
  label,
  activeColor = 'bg-purple-600',
  inactiveColor = 'bg-gray-300'
}) => {
  // Size configurations
  const sizeClasses = {
    sm: {
      container: 'w-9 h-5',
      circle: 'w-3.5 h-3.5',
      translate: 'translate-x-4',
      labelGap: 'gap-1.5'
    },
    md: {
      container: 'w-11 h-6',
      circle: 'w-4.5 h-4.5',
      translate: 'translate-x-5',
      labelGap: 'gap-2'
    },
    lg: {
      container: 'w-14 h-7',
      circle: 'w-5.5 h-5.5',
      translate: 'translate-x-7',
      labelGap: 'gap-2.5'
    }
  };

  const { container, circle, translate, labelGap } = sizeClasses[size];

  const uniqueId = id || `toggle-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`inline-flex items-center ${className} ${labelGap} ${disabled ? 'opacity-60' : ''}`}>
      {label && (
        <label htmlFor={uniqueId} className={`text-sm font-medium text-gray-700 mr-2 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          {label}
        </label>
      )}
      <button
        id={uniqueId}
        role="switch"
        aria-checked={checked}
        onClick={disabled ? undefined : onChange}
        type="button"
        className={`
          relative inline-flex shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-opacity-75 focus-visible:ring-offset-2
          ${container}
          ${checked ? activeColor : inactiveColor}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        disabled={disabled}
      >
        <span className="sr-only">{checked ? 'Enabled' : 'Disabled'}</span>
        <span
          className={`
            absolute transform transition-transform duration-300 ease-in-out rounded-full bg-white shadow-md
            ${circle}
            ${checked ? translate : 'translate-x-0.5'}
          `}
        />
      </button>
    </div>
  );
};

export default CustomToggleSwitch;