import React from 'react';
import { Type, Plus } from 'lucide-react';
import ColorPicker from '../components/ColorPicker';

interface TextToolsProps {
  color: string;
  setColor: (color: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  onAddText: () => void;
}

const TextTools: React.FC<TextToolsProps> = ({
  color,
  setColor,
  fontSize,
  setFontSize,
  showColorPicker,
  setShowColorPicker,
  onAddText
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Type size={16} className="text-orange-600" />
        <span className="text-sm font-medium text-gray-700">Text</span>
      </div>
      
      <button
        onClick={onAddText}
        className="w-full px-3 py-2 text-sm bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
      >
        <Plus size={16} className="inline mr-2" />
        Add Text
      </button>
      
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-2">
          <Type size={14} />
          Font Size
        </label>
        <input
          type="range"
          min="12"
          max="72"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="text-xs text-gray-500 text-center">{fontSize}px</div>
      </div>
      
      <ColorPicker
        color={color}
        setColor={setColor}
        showColorPicker={showColorPicker}
        setShowColorPicker={setShowColorPicker}
        label="Text Color"
      />
    </div>
  );
};

export default TextTools;