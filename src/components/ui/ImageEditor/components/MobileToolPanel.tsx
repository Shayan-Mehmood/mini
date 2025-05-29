import React from 'react';
import { X } from 'lucide-react';
import { CategoryType } from '../types';

interface MobileToolPanelProps {
  children: React.ReactNode;
  onClose: () => void;
  activeCategory: CategoryType;
}

const MobileToolPanel: React.FC<MobileToolPanelProps> = ({
  children,
  onClose,
  activeCategory
}) => {
  // Map category to title
  const getTitleForCategory = (): string => {
    switch (activeCategory) {
      case 'selection': return 'Selection Tools';
      case 'shapes': return 'Shape Tools';
      case 'text': return 'Text Tools';
      case 'transform': return 'Transform Tools';
      default: return 'Tools';
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg transform transition-transform duration-300 ease-out max-h-[60vh] z-20">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-medium text-gray-800">
          {getTitleForCategory()}
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 50px)' }}>
        {children}
      </div>
      
      {/* Handle for dragging */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full"></div>
    </div>
  );
};

export default MobileToolPanel;