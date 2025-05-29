import * as fabric from 'fabric';

export const CATEGORIES = {
  SELECTION: 'selection',
  // DRAWING: 'drawing',
  SHAPES: 'shapes',
  TEXT: 'text',
  TRANSFORM: 'transform',
  // FILTERS: 'filters'
} as const;

export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES];

export interface ToolProps {
  canvas: fabric.Canvas | null;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  activeMode: string;
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
  selectedObject: fabric.Object | null;
}

export interface FilterProps {
  brightness: number;
  setBrightness: (value: number) => void;
  contrast: number;
  setContrast: (value: number) => void;
  saturation: number;
  setSaturation: (value: number) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}