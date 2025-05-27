import React from 'react';
import { ChevronLeft, ChevronRight, Move, Pencil, Square, Type, Crop, Sliders } from 'lucide-react';
import { CATEGORIES, CategoryType } from '../types';
import SelectionTools from '../tools/SelectionTools';
import DrawingTools from '../tools/DrawingTools';
import ShapeTools from '../tools/ShapeTools';
import TextTools from '../tools/TextTools';
import TransformTools from '../tools/TransformTools';
import FilterTools from '../tools/FilterTools';

interface SidebarProps {
  canvas: any;
  activeCategory: CategoryType;
  setActiveCategory: (category: CategoryType) => void;
  activeMode: string;
  setActiveMode: (mode: string) => void;
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  brightness: number;
  setBrightness: (value: number) => void;
  contrast: number;
  setContrast: (value: number) => void;
  saturation: number;
  setSaturation: (value: number) => void;
  selectedObject: any;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  onSelectMode: () => void;
  onDrawingMode: () => void;
  onAddText: () => void;
  onAddShape: (shape: string) => void;
  onDeleteSelected: () => void;
  onCrop: () => void;
  onRotate: (direction: 'left' | 'right') => void;
  onFlip: (direction: 'horizontal' | 'vertical') => void;
  onConfirmCrop: () => void;
  onApplyFilters: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  canvas,
  activeCategory,
  setActiveCategory,
  activeMode,
  setActiveMode,
  activeTool,
  setActiveTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  fontSize,
  setFontSize,
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  selectedObject,
  showColorPicker,
  setShowColorPicker,
  sidebarCollapsed,
  setSidebarCollapsed,
  onSelectMode,
  onDrawingMode,
  onAddText,
  onAddShape,
  onDeleteSelected,
  onCrop,
  onRotate,
  onFlip,
  onConfirmCrop,
  onApplyFilters
}) => {
  const categories = [
    { id: CATEGORIES.SELECTION, icon: Move, label: 'Selection', color: 'text-blue-600' },
    { id: CATEGORIES.DRAWING, icon: Pencil, label: 'Drawing', color: 'text-green-600' },
    { id: CATEGORIES.SHAPES, icon: Square, label: 'Shapes', color: 'text-purple-600' },
    { id: CATEGORIES.TEXT, icon: Type, label: 'Text', color: 'text-orange-600' },
    { id: CATEGORIES.TRANSFORM, icon: Crop, label: 'Transform', color: 'text-red-600' },
    { id: CATEGORIES.FILTERS, icon: Sliders, label: 'Filters', color: 'text-indigo-600' }
  ];

  const CategoryButton = ({ category, icon: Icon, label, color }: any) => (
    <button
      onClick={() => setActiveCategory(category)}
      className={`flex items-center w-full px-4 py-3 rounded-xl text-left transition-all duration-200 ${
        activeCategory === category
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 shadow-sm'
          : 'text-slate-700 hover:bg-slate-50 border border-transparent'
      }`}
      title={label}
    >
      <Icon size={20} className={`${color} mr-3 flex-shrink-0`} />
      {!sidebarCollapsed && <span className="font-medium">{label}</span>}
    </button>
  );

  const renderCategoryTools = () => {
    switch (activeCategory) {
      case CATEGORIES.SELECTION:
        return (
          <SelectionTools
            activeMode={activeMode}
            activeTool={activeTool}
            selectedObject={selectedObject}
            onSelectMode={onSelectMode}
            onDeleteSelected={onDeleteSelected}
          />
        );
      case CATEGORIES.DRAWING:
        return (
          <DrawingTools
            activeMode={activeMode}
            color={color}
            setColor={setColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            showColorPicker={showColorPicker}
            setShowColorPicker={setShowColorPicker}
            onDrawingMode={onDrawingMode}
          />
        );
      case CATEGORIES.SHAPES:
        return (
          <ShapeTools
            color={color}
            setColor={setColor}
            strokeWidth={strokeWidth}
            setStrokeWidth={setStrokeWidth}
            showColorPicker={showColorPicker}
            setShowColorPicker={setShowColorPicker}
            onAddShape={onAddShape}
          />
        );
      case CATEGORIES.TEXT:
        return (
          <TextTools
            color={color}
            setColor={setColor}
            fontSize={fontSize}
            setFontSize={setFontSize}
            showColorPicker={showColorPicker}
            setShowColorPicker={setShowColorPicker}
            onAddText={onAddText}
          />
        );
      case CATEGORIES.TRANSFORM:
        return (
          <TransformTools
            activeTool={activeTool}
            canvas={canvas}
            onCrop={onCrop}
            onRotate={onRotate}
            onFlip={onFlip}
            onConfirmCrop={onConfirmCrop}
            setActiveTool={setActiveTool}
          />
        );
      case CATEGORIES.FILTERS:
        return (
          <FilterTools
            brightness={brightness}
            setBrightness={setBrightness}
            contrast={contrast}
            setContrast={setContrast}
            saturation={saturation}
            setSaturation={setSaturation}
            onApplyFilters={onApplyFilters}
            onResetFilters={() => {
              setBrightness(0);
              setContrast(0);
              setSaturation(0);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex bg-white border-r border-slate-200 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-80'}`}>
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100">
          {!sidebarCollapsed && (
            <h3 className="font-bold text-slate-900 text-lg">Editor Tools</h3>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-xl hover:bg-white transition-all shadow-sm border border-slate-200"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        {/* Categories */}
        <div className="p-4 space-y-2 border-b border-slate-200 bg-slate-50">
          {categories.map((category) => (
            <CategoryButton key={category.id} {...category} />
          ))}
        </div>
        
        {/* Tools */}
        {!sidebarCollapsed && (
          <div className="flex-1 p-4 overflow-y-auto">
            {renderCategoryTools()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;