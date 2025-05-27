import React from 'react';
import { Crop, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Check } from 'lucide-react';

interface TransformToolsProps {
  activeTool: string | null;
  canvas: any;
  onCrop: () => void;
  onRotate: (direction: 'left' | 'right') => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onConfirmCrop: () => void;
  setActiveTool: (tool: string | null) => void;
}

const TransformTools: React.FC<TransformToolsProps> = ({
  activeTool,
  onCrop,
  onRotate,
  onFlip,
  onConfirmCrop
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Crop size={16} className="text-red-600" />
        <span className="text-sm font-medium text-gray-700">Transform</span>
      </div>
      
      <button
        onClick={onCrop}
        className="w-full px-3 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
      >
        <Crop size={16} className="inline mr-2" />
        Crop Image
      </button>
      
      {activeTool === 'crop-confirm' && (
        <button
          onClick={onConfirmCrop}
          className="w-full px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <Check size={16} className="inline mr-2" />
          Confirm Crop
        </button>
      )}
      
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Rotate</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onRotate('left')}
            className="flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Rotate Left"
          >
            <RotateCcw size={16} className="text-red-600" />
          </button>
          <button
            onClick={() => onRotate('right')}
            className="flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Rotate Right"
          >
            <RotateCw size={16} className="text-red-600" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Flip</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onFlip('horizontal')}
            className="flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Flip Horizontal"
          >
            <FlipHorizontal size={16} className="text-red-600" />
          </button>
          <button
            onClick={() => onFlip('vertical')}
            className="flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Flip Vertical"
          >
            <FlipVertical size={16} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransformTools;