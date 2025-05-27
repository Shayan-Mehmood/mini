import React from 'react';
import { Sliders, Sun, Contrast, Palette, RotateCcw, Check } from 'lucide-react';

interface FilterToolsProps {
  brightness: number;
  setBrightness: (value: number) => void;
  contrast: number;
  setContrast: (value: number) => void;
  saturation: number;
  setSaturation: (value: number) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const FilterTools: React.FC<FilterToolsProps> = ({
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  onApplyFilters,
  onResetFilters
}) => {
  const hasChanges = brightness !== 0 || contrast !== 0 || saturation !== 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Sliders size={16} className="text-indigo-600" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-2">
            <Sun size={14} />
            Brightness
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 text-center">
            {brightness > 0 ? '+' : ''}{brightness}%
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-2">
            <Contrast size={14} />
            Contrast
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 text-center">
            {contrast > 0 ? '+' : ''}{contrast}%
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide flex items-center gap-2">
            <Palette size={14} />
            Saturation
          </label>
          <input
            type="range"
            min="-100"
            max="100"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 text-center">
            {saturation > 0 ? '+' : ''}{saturation}%
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 pt-2">
        <button
          onClick={onResetFilters}
          disabled={!hasChanges}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw size={14} className="inline mr-1" />
          Reset
        </button>
        <button
          onClick={onApplyFilters}
          disabled={!hasChanges}
          className="flex-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check size={14} className="inline mr-1" />
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterTools;