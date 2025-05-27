import React from 'react';
import { Pencil, Brush } from 'lucide-react';
import ColorPicker from '../components/ColorPicker';

interface DrawingToolsProps {
  activeMode: string;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  onDrawingMode: () => void;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({
  activeMode,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  showColorPicker,
  setShowColorPicker,
  onDrawingMode
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Pencil size={16} className="text-green-600" />
        <span className="text-sm font-medium text-gray-700">Drawing</span>
      </div>
      
      <button
        onClick={onDrawingMode}
        className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
          activeMode === 'drawing' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Brush size={16} className="inline mr-2" />
        Free Draw
      </button>
      
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-2">
          <Brush size={14} />
          Brush Size
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-xs text-gray-500 text-center">{strokeWidth}px</div>
      </div>
      
      <ColorPicker
        color={color}
        setColor={setColor}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        label="Brush Color"
      />

      {activeMode === 'drawing' && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 font-medium">Drawing Mode Active</p>
          <p className="text-xs text-green-600 mt-1">Click and drag to draw</p>
        </div>
      )}
    </div>
  );
};

export default DrawingTools;