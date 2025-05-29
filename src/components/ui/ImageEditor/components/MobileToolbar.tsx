import React from 'react';
import { Move, Square, Type, Crop, Download, PanelLeft, Hand } from 'lucide-react';
import { CATEGORIES, CategoryType } from '../types';

interface MobileToolbarProps {
  activeCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  onTogglePan: () => void;
  isPanning: boolean;
  onDownload: () => void;
}

const MobileToolbar: React.FC<MobileToolbarProps> = ({
  activeCategory,
  onSelectCategory,
  onTogglePan,
  isPanning,
  onDownload
}) => {
  const tools = [
    { icon: Move, category: CATEGORIES.SELECTION, label: "Select" },
    { icon: Square, category: CATEGORIES.SHAPES, label: "Shapes" },
    { icon: Type, category: CATEGORIES.TEXT, label: "Text" },
    { icon: Crop, category: CATEGORIES.TRANSFORM, label: "Transform" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-2 shadow-lg">
      {tools.map(({ icon: Icon, category, label }) => (
        <button
          key={category}
          className={`flex flex-col items-center p-2 ${
            activeCategory === category 
              ? 'text-purple-600' 
              : 'text-gray-600'
          }`}
          onClick={() => onSelectCategory(category)}
        >
          <Icon size={20} />
          <span className="text-xs mt-1">{label}</span>
        </button>
      ))}
      
      <button
        className={`flex flex-col items-center p-2 ${
          isPanning ? 'text-purple-600' : 'text-gray-600'
        }`}
        onClick={onTogglePan}
      >
        <Hand size={20} />
        <span className="text-xs mt-1">Pan</span>
      </button>
      
      <button
        className="flex flex-col items-center p-2 text-gray-600"
        onClick={onDownload}
      >
        <Download size={20} />
        <span className="text-xs mt-1">Save</span>
      </button>
    </div>
  );
};

export default MobileToolbar;