import React from 'react';
import { Minus, Plus, Download, Check } from 'lucide-react';

interface TopToolbarProps {
  zoomLevel: number;
  onZoom: (zoom: number) => void;
  onDownload: () => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isSaving: boolean;
  hasError: boolean;
}

const TopToolbar: React.FC<TopToolbarProps> = ({
  zoomLevel,
  onZoom,
  onDownload,
  onSave,
  onCancel,
  isLoading,
  isSaving,
  hasError
}) => {
  return (
    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm">
      {/* Zoom Controls */}
      <div className="flex items-center bg-gray-50 rounded-lg p-1">
        <button
          onClick={() => onZoom(Math.max(50, zoomLevel - 10))}
          className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50"
          disabled={zoomLevel <= 50}
          title="Zoom out"
        >
          <Minus size={16} className="text-gray-600" />
        </button>
        
        <span className="text-sm mx-3 font-medium text-gray-700 min-w-[50px] text-center">
          {zoomLevel}%
        </span>
        
        <button
          onClick={() => onZoom(Math.min(200, zoomLevel + 10))}
          className="p-2 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 disabled:opacity-50"
          disabled={zoomLevel >= 200}
          title="Zoom in"
        >
          <Plus size={16} className="text-gray-600" />
        </button>
        
        <button
          onClick={() => onZoom(100)}
          className="ml-2 px-3 py-1.5 text-xs rounded-md hover:bg-white hover:shadow-sm border border-gray-200 transition-all duration-200 text-gray-600 font-medium"
          title="Reset zoom"
        >
          Reset
        </button>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onDownload}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm flex items-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isSaving}
          title="Download image"
        >
          <Download size={16} className="mr-2 text-gray-600" />
          <span className="text-gray-700 font-medium">Download</span>
        </button>
        
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isSaving}
          title="Cancel editing"
        >
          <span className="text-gray-700 font-medium">Cancel</span>
        </button>
        
        <button
          onClick={onSave}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-sm flex items-center transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isSaving || hasError}
          title="Apply changes"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="font-medium">Saving...</span>
            </>
          ) : (
            <>
              <Check size={16} className="mr-2" />
              <span className="font-medium">Apply Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TopToolbar;