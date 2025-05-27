import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { X, Palette } from 'lucide-react';

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  setColor,
  showColorPicker,
  setShowColorPicker,
  label = "Color"
}) => {
  const presetColors = [
    '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF',
    '#FF0000', '#FF8000', '#FFD700', '#00FF00', '#00FFFF',
    '#0080FF', '#8000FF', '#FF00FF', '#8B4513', '#228B22'
  ];

  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-2">
        <Palette size={14} />
        {label}
      </label>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-10 h-10 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
          style={{ backgroundColor: color }}
          title="Pick a color"
        />
        
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
          placeholder="#000000"
        />
      </div>

      {/* Preset Colors */}
      <div className="grid grid-cols-5 gap-1.5">
        {presetColors.map((presetColor) => (
          <button
            key={presetColor}
            onClick={() => setColor(presetColor)}
            className={`w-6 h-6 rounded border transition-all hover:scale-105 ${
              color === presetColor ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200'
            }`}
            style={{ backgroundColor: presetColor }}
            title={presetColor}
          />
        ))}
      </div>
      
      {showColorPicker && (
        <div className="absolute z-50 mt-2">
          <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Pick Color</span>
              <button
                onClick={() => setShowColorPicker(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded overflow-hidden">
              <HexColorPicker color={color} onChange={setColor} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;