import React from 'react';
import { Move, Trash2, MousePointer } from 'lucide-react';

interface SelectionToolsProps {
  activeMode: string;
  activeTool: string | null;
  selectedObject: any;
  onSelectMode: () => void;
  onDeleteSelected: () => void;
}

const SelectionTools: React.FC<SelectionToolsProps> = ({
  activeMode,
  selectedObject,
  onSelectMode,
  onDeleteSelected
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <MousePointer size={16} className="text-blue-600" />
        <span className="text-sm font-medium text-gray-700">Selection</span>
      </div>
      
      <button
        onClick={onSelectMode}
        className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
          activeMode === 'select' 
            ? 'bg-blue-50 border-blue-200 text-blue-700' 
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Move size={16} className="inline mr-2" />
        Select Mode
      </button>
      
      {selectedObject && (
        <button
          onClick={onDeleteSelected}
          className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 size={16} className="inline mr-2" />
          Delete Selected
        </button>
      )}
    </div>
  );
};

export default SelectionTools;