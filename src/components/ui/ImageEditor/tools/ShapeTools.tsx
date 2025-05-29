import React from 'react';
import { Square, Circle, Triangle, Star, Shapes } from 'lucide-react';
import ColorPicker from '../components/ColorPicker';

interface ShapeToolsProps {
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  onAddShape: (shape: string) => void;
}

const ShapeTools: React.FC<ShapeToolsProps> = ({
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  showColorPicker,
  setShowColorPicker,
  onAddShape
}) => {
  const shapes = [
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'triangle', icon: Triangle, label: 'Triangle' },
    // { id: 'star', icon: Star, label: 'Star' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Shapes size={16} className="text-purple-600" />
        <span className="text-sm font-medium text-gray-700">Shapes</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {shapes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onAddShape(id)}
            className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title={label}
          >
            <Icon size={20} className="text-purple-600 mb-1" />
            <span className="text-xs text-gray-600">{label}</span>
          </button>
        ))}
      </div>
      
      {/* <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-2">
          <Square size={14} />
          Border Width
        </label>
        <input
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-xs text-gray-500 text-center">{strokeWidth}px</div>
      </div> */}
      
      <ColorPicker
        color={color}
        setColor={setColor}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        label="Border Color"
      />
    </div>
  );
};

export default ShapeTools;