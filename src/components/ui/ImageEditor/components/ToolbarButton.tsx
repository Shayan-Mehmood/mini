import React from 'react';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  isActive = false,
  disabled = false,
  variant = 'secondary',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'inline-flex flex-col items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105 active:scale-95';
  
  const sizeClasses = {
    sm: 'p-2 text-xs gap-1',
    md: 'p-3 text-sm gap-1.5',
    lg: 'p-4 text-base gap-2'
  };
  
  const variantClasses = {
    primary: isActive 
      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg border border-indigo-600 focus:ring-indigo-500 shadow-indigo-200' 
      : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 focus:ring-indigo-500',
    secondary: isActive 
      ? 'bg-slate-900 text-white shadow-lg border border-slate-900 focus:ring-slate-500 shadow-slate-200' 
      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500 shadow-sm hover:shadow-md',
    ghost: isActive 
      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none hover:scale-100';
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? disabledClasses : ''}
        ${className}
      `}
      title={label}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="leading-tight font-medium">{label}</span>
    </button>
  );
};

export default ToolbarButton;