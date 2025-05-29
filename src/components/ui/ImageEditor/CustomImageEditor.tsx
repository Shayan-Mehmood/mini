import React, { useRef, useState, useEffect } from 'react';
import * as fabric from 'fabric';
import { Canvas, Image as FabricImage } from 'fabric';
import { saveAs } from 'file-saver';
import { useMediaQuery } from 'react-responsive'; // Add this import

// Import smaller components
import ToolsSidebar from './components/ToolsSidebar';
import TopToolbar from './components/TopToolbar';
import CanvasArea from './components/CanvasArea';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorOverlay from './components/ErrorOverlay';
import MobileToolbar from './components/MobileToolbar'; // New component for mobile
import MobileToolPanel from './components/MobileToolPanel'; // New component for mobile tool panels
import { CATEGORIES, CategoryType } from './types';

// Import tool components - keep your existing imports
import SelectionTools from './tools/SelectionTools';
import ShapeTools from './tools/ShapeTools';
import TextTools from './tools/TextTools';
import TransformTools from './tools/TransformTools';
import FilterTools from './tools/FilterTools';

interface CustomImageEditorProps {
  initialImageUrl: string;
  onSave: (editedImageUrl: string) => void;
  isCoverEdit?: boolean;
}

const CustomImageEditor: React.FC<CustomImageEditorProps> = ({ 
  initialImageUrl, 
  onSave,
  isCoverEdit = false
}) => {
  // Media query for responsive design
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  // Canvas refs - keep your existing refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasInstanceRef = useRef<Canvas | null>(null);
  
  // Core state - keep your existing state
  const [activeCategory, setActiveCategory] = useState<CategoryType>(CATEGORIES.SELECTION);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // New mobile state
  const [showMobileToolPanel, setShowMobileToolPanel] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastTouch, setLastTouch] = useState<{ x: number, y: number } | null>(null);
  
  // Tool state - keep your existing state
  const [activeMode, setActiveMode] = useState<string>('select');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<object | null>(null);
  
  // Style properties - keep your existing properties
  const [color, setColor] = useState('#4f46e5');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(24);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Filter properties - keep your existing properties
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  
  // UI state - keep your existing state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  // Toggle mobile tool panel
  const toggleMobileToolPanel = () => {
    setShowMobileToolPanel(prev => !prev);
  };

  // Select a tool category on mobile
  const selectMobileCategory = (category: CategoryType) => {
    setActiveCategory(category);
    setShowMobileToolPanel(true);
  };

  // Toggle panning mode for mobile
  const togglePanMode = () => {
    setIsPanning(prev => !prev);
  };

  // Keep your existing useEffect for canvas initialization - just add mobile touch handling
  useEffect(() => {
    if (!canvasRef.current || !canvasWrapperRef.current) return;

    try {
      // Get container dimensions for canvas size
      const containerWidth = canvasWrapperRef.current.clientWidth || 800;
      const containerHeight = canvasWrapperRef.current.clientHeight || 600;
      
      // Initialize canvas with proper dimensions
      const canvas = new Canvas(canvasRef.current, {
        width: containerWidth,
        height: containerHeight,
      });
      
      canvasInstanceRef.current = canvas;
      
      // Set up resize handler
      const handleResize = () => {
        if (!canvasWrapperRef.current || !canvas) return;
        
        const newWidth = canvasWrapperRef.current.clientWidth;
        const newHeight = canvasWrapperRef.current.clientHeight;
        
        if (newWidth > 0 && newHeight > 0) {
          canvas.setDimensions({ width: newWidth, height: newHeight });
          canvas.renderAll();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Use the exact same pattern as before for loading the image
      const loadImage = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        canvas.clear();
        
        try {
          // Use the same async/await pattern as before
          const img = await FabricImage.fromURL(initialImageUrl, {
            crossOrigin: 'anonymous',
          });
          
          // Get canvas dimensions
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          
          // Get image dimensions
          const imgWidth = img.width ?? 100;
          const imgHeight = img.height ?? 100;
          
          // Calculate scaling to fit within canvas with padding
          const padding = isMobile ? 20 : 40; // Smaller padding on mobile
          const availableWidth = canvasWidth - padding;
          const availableHeight = canvasHeight - padding;
          
          const scaleX = availableWidth / imgWidth;
          const scaleY = availableHeight / imgHeight;
          const scale = Math.min(scaleX, scaleY, 1);
          
          // Center the image
          const centerX = (canvasWidth - (imgWidth * scale)) / 2;
          const centerY = (canvasHeight - (imgHeight * scale)) / 2;
          
          img.set({
            left: centerX,
            top: centerY,
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            evented: true,
          });
          
          canvas.add(img);
          canvas.renderAll();
          setIsLoading(false);
          
          console.log('✅ Image loaded successfully');
          
        } catch (error) {
          console.error('Error loading image:', error);
          setErrorMessage("Failed to load image");
          setIsLoading(false);
        }
      };

      // Load the image
      loadImage();
      
      // Set up event listeners
      canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
      canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
      canvas.on('selection:cleared', () => setSelectedObject(null));
      
      // Add touch events for panning on mobile
      if (isMobile && canvasRef.current) {
        const canvasElement = canvasRef.current;
        
        const handleTouchStart = (e: TouchEvent) => {
          if (e.touches.length === 1) {
            const touch = e.touches[0];
            setLastTouch({ x: touch.clientX, y: touch.clientY });
          }
        };
        
        const handleTouchMove = (e: TouchEvent) => {
          if (e.touches.length === 1 && lastTouch && isPanning) {
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastTouch.x;
            const deltaY = touch.clientY - lastTouch.y;
            
            // Pan the canvas
            const vpt = canvas.viewportTransform!;
            vpt[4] += deltaX;
            vpt[5] += deltaY;
            canvas.renderAll();
            
            setLastTouch({ x: touch.clientX, y: touch.clientY });
          }
        };
        
        const handleTouchEnd = () => {
          setLastTouch(null);
        };
        
        canvasElement.addEventListener('touchstart', handleTouchStart);
        canvasElement.addEventListener('touchmove', handleTouchMove);
        canvasElement.addEventListener('touchend', handleTouchEnd);
        
        return () => {
          canvasElement.removeEventListener('touchstart', handleTouchStart);
          canvasElement.removeEventListener('touchmove', handleTouchMove);
          canvasElement.removeEventListener('touchend', handleTouchEnd);
          window.removeEventListener('resize', handleResize);
          canvas.dispose();
        };
      }
      
      return () => {
        window.removeEventListener('resize', handleResize);
        canvas.dispose();
      };
    } catch (error) {
      console.error('Error initializing canvas:', error);
      setErrorMessage('Failed to initialize editor. Please try refreshing the page.');
      setIsLoading(false);
    }
  }, [initialImageUrl, isMobile, lastTouch, isPanning]);

  // Keep all your existing handler functions as they are
  // Just add a mobile panel close to some of them for better mobile UX
  const handleSelectMode = (): void => {
    if (!canvasInstanceRef.current) return;
    setActiveMode('select');
    setActiveTool(null);
    setActiveCategory(CATEGORIES.SELECTION);
    canvasInstanceRef.current.isDrawingMode = false;
    
    // Close mobile panel on selection
    if (isMobile) {
      setShowMobileToolPanel(false);
    }
  };

  const handleAddText = (): void => {
    const canvas = canvasInstanceRef.current as fabric.Canvas | null;
    if (!canvas) return;
    const text = new fabric.IText('Double click to edit', {
      left: 50,
      top: 50,
      fontFamily: 'Arial',
      fill: color,
      fontSize: fontSize
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    
    // Close mobile panel after action
    if (isMobile) {
      setShowMobileToolPanel(false);
    }
  };

  const handleAddShape = (shape: string): void => {
    const canvas = canvasInstanceRef.current as fabric.Canvas | null;
    if (!canvas) return;
    let fabricObject;
    switch (shape) {
      case 'rectangle':
        fabricObject = new fabric.Rect({
          left: 50,
          top: 50,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: color,
          strokeWidth: strokeWidth
        });
        break;
      case 'circle':
        fabricObject = new fabric.Circle({
          left: 50,
          top: 50,
          radius: 50,
          fill: 'transparent',
          stroke: color,
          strokeWidth: strokeWidth
        });
        break;
      case 'triangle':
        fabricObject = new fabric.Triangle({
          left: 50,
          top: 50,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: color,
          strokeWidth: strokeWidth
        });
        break;
      default:
        return;
    }
    canvas.add(fabricObject);
    canvas.setActiveObject(fabricObject);
    canvas.renderAll();
  };

  const handleDeleteSelected = (): void => {
    const canvas = canvasInstanceRef.current;
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  // const handleSave = async (): Promise<void> => {
  //   const canvas = canvasInstanceRef.current as fabric.Canvas | null;
  //   if (!canvas) return;
    
  //   try {
  //     setIsSaving(true);
  //     canvas.discardActiveObject();
  //     canvas.renderAll();
      
  //     const dataUrl = canvas.toDataURL({ multiplier: 1, format: 'jpeg', quality: 0.9 });
  //     onSave(dataUrl);
  //   } catch (error) {
  //     console.error('Error saving image:', error);
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // const handleDownload = (): void => {
  //   const canvas = canvasInstanceRef.current as fabric.Canvas | null;
  //   if (!canvas) return;
    
  //   canvas.discardActiveObject();
  //   canvas.renderAll();
    
  //   const dataUrl = canvas.toDataURL({ multiplier: 1, format: 'jpeg', quality: 0.9 });
  //   const link = document.createElement('a');
  //   link.href = dataUrl;
  //   link.download = 'edited-image.jpg';
  //   link.click();
  // };

  const handleSave = async (): Promise<void> => {
  const canvas = canvasInstanceRef.current as fabric.Canvas | null;
  if (!canvas) return;
  
  try {
    setIsSaving(true);
    canvas.discardActiveObject();
    canvas.renderAll();
    
    // Changed from jpeg to png to preserve transparency
    const dataUrl = canvas.toDataURL({ multiplier: 1, format: 'png' });
    onSave(dataUrl);
  } catch (error) {
    console.error('Error saving image:', error);
  } finally {
    setIsSaving(false);
  }
};

const handleDownload = (): void => {
  const canvas = canvasInstanceRef.current as fabric.Canvas | null;
  if (!canvas) return;
  
  canvas.discardActiveObject();
  canvas.renderAll();
  
  // Changed from jpeg to png to preserve transparency
  const dataUrl = canvas.toDataURL({ multiplier: 1, format: 'png' });
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'edited-image.png'; // Changed extension to png
  link.click();
};

  // Add this function after your other handler functions
const handleColorChange = (newColor: string): void => {
  // Update the state
  setColor(newColor);

  const canvas = canvasInstanceRef.current;
  if (!canvas) return;

  // Apply color to currently selected object if any
  const activeObject = canvas.getActiveObject();
  if (activeObject && activeObject.type !== 'image') {
    // For shapes and text (not images)
    if (activeObject.type === 'i-text' || activeObject.type === 'text') {
      activeObject.set('fill', newColor);
    } else {
      // For shapes (we keep the fill transparent but change the stroke)
      activeObject.set('stroke', newColor);
    }
    canvas.renderAll();
  }

  // Also update drawing brush if in drawing mode
  if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.color = newColor;
  }
};

// Add after handleDownload
const handleZoom = (newZoomLevel: number): void => {
  const canvas = canvasInstanceRef.current;
  if (!canvas) return;
  
  // Calculate zoom ratio compared to previous level
  const ratio = newZoomLevel / zoomLevel;
  
  // Get canvas center
  const center = {
    x: canvas.width! / 2,
    y: canvas.height! / 2
  };
  
  // Apply zoom by scaling the viewport
  canvas.zoomToPoint(
    new fabric.Point(center.x, center.y),
    canvas.getZoom() * ratio
  );
  
  // Update zoom level state
  setZoomLevel(newZoomLevel);
  canvas.renderAll();
};

const handleCrop = (): void => {
  setActiveTool('crop');
  const canvas = canvasInstanceRef.current;
  if (!canvas) return;
  
  // Create a crop rectangle
  const rect = new fabric.Rect({
    left: 50,
    top: 50,
    width: canvas.getWidth() - 100,
    height: canvas.getHeight() - 100,
    fill: 'rgba(0,0,0,0.2)',
    stroke: '#fff',
    strokeDashArray: [5, 5],
    strokeWidth: 2,
  });
  
  canvas.add(rect);
  canvas.setActiveObject(rect);
  canvas.renderAll();
};

const handleRotate = (direction: 'left' | 'right'): void => {
  const canvas = canvasInstanceRef.current;
  if (!canvas) return;
  
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    // Rotate selected object
    const angle = direction === 'left' ? -90 : 90;
    activeObject.rotate!((activeObject.angle || 0) + angle);
    canvas.renderAll();
  }
};

const handleFlip = (direction: 'horizontal' | 'vertical'): void => {
  const canvas = canvasInstanceRef.current;
  if (!canvas) return;
  
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    // Flip selected object
    if (direction === 'horizontal') {
      activeObject.flipX = !activeObject.flipX;
    } else {
      activeObject.flipY = !activeObject.flipY;
    }
    canvas.renderAll();
  }
};
const handleConfirmCrop = (): void => {
  const canvas = canvasInstanceRef.current;
  if (!canvas) return;
  
  setActiveTool(null);
  
  const activeObject = canvas.getActiveObject();
  if (!activeObject || activeObject.type !== 'rect') return;
  
  const cropRect = activeObject as fabric.Rect;
  const left = cropRect.left || 0;
  const top = cropRect.top || 0;
  const width = cropRect.getScaledWidth();
  const height = cropRect.getScaledHeight();
  
  // Remove the crop rectangle
  canvas.remove(cropRect);
  
  // Get all objects on the canvas
  const objects = canvas.getObjects();
  
  // Create a clip path rectangle
  const clipPath = new fabric.Rect({
    left: 0,
    top: 0,
    width: width,
    height: height,
    absolutePositioned: true
  });
  
  // Apply the clip path to all objects
  objects.forEach(obj => {
    // Adjust object position relative to the crop area
    obj.set({
      left: obj.left! - left,
      top: obj.top! - top
    });
    
    // Set clip path if the object isn't the crop rectangle itself
    obj.clipPath = clipPath;
  });
  
  // Update canvas dimensions to match crop area
  canvas.setDimensions({
    width: width,
    height: height
  });
  
  // Adjust viewport to show the cropped area
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.renderAll();
};

const handleFontSizeChange = (newSize: number): void => {
  // Update the state
  setFontSize(newSize);

  const canvas = canvasInstanceRef.current;
  if (!canvas) return;

  // Apply font size to currently selected text object
  const activeObject = canvas.getActiveObject();
  if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
    activeObject.set('fontSize', newSize);
    canvas.renderAll();
  }
};

// Add these filter handler functions after handleFontSizeChange

// const handleApplyFilters = (): void => {
//   const canvas = canvasInstanceRef.current;
//   if (!canvas) return;

//   // Find the image object in the canvas
//   const objects = canvas.getObjects();
//   const imageObj = objects.find(obj => obj.type === 'image');
  
//   if (!imageObj || imageObj.type !== 'image') return;
  
//   // Use more explicit type casting to avoid TypeScript errors
//   const fabricImage = imageObj as any;
  
//   // Reset filters array
//   fabricImage.filters = [];
  
//   try {
//     // Apply filters based on slider values with proper type assertions
//     if (brightness !== 0) {
//       // Access filter constructor with type assertion
//       const BrightnessFilter = (fabric.Image as any).filters.Brightness;
//       if (BrightnessFilter) {
//         fabricImage.filters.push(new BrightnessFilter({
//           brightness: brightness / 100
//         }));
//       }
//     }
    
//     if (contrast !== 0) {
//       const ContrastFilter = (fabric.Image as any).filters.Contrast;
//       if (ContrastFilter) {
//         fabricImage.filters.push(new ContrastFilter({
//           contrast: contrast / 100
//         }));
//       }
//     }
    
//     if (saturation !== 0) {
//       const SaturationFilter = (fabric.Image as any).filters.Saturation;
//       if (SaturationFilter) {
//         fabricImage.filters.push(new SaturationFilter({
//           saturation: saturation / 100
//         }));
//       }
//     }
    
//     // Apply filters to the image
//     fabricImage.applyFilters();
//     canvas.renderAll();
//   } catch (error) {
//     console.error("Error applying filters:", error);
//   }
// };

const handleResetFilters = (): void => {
  const canvas = canvasInstanceRef.current;
  if (!canvas) return;
  
  // Reset filter states
  setBrightness(0);
  setContrast(0);
  setSaturation(0);
  
  // Remove filters from the image
  const objects = canvas.getObjects();
  const imageObj = objects.find(obj => obj.type === 'image');
  
  if (imageObj && imageObj.type === 'image') {
    // Type assertion to bypass TypeScript errors
    const fabricImage = imageObj as any;
    fabricImage.filters = [];
    fabricImage.applyFilters();
    canvas.renderAll();
  }
};



  // Render tool components based on active category
  const renderToolComponent = (): React.ReactNode => {
    switch (activeCategory) {
      case CATEGORIES.SELECTION:
        return (
          <SelectionTools
            activeMode={activeMode}
            activeTool={activeTool}
            selectedObject={selectedObject}
            onSelectMode={handleSelectMode}
            onDeleteSelected={handleDeleteSelected}
          />
        );
      
  //     case CATEGORIES.DRAWING:
  // return (
  //   <DrawingTools
  //     activeMode={activeMode}
  //     color={color}
  //     setColor={handleColorChange}  // Updated
  //     strokeWidth={strokeWidth}
  //     setStrokeWidth={setStrokeWidth}
  //     showColorPicker={showColorPicker}
  //     setShowColorPicker={setShowColorPicker}
  //     onDrawingMode={handleDrawingMode}
  //   />
  // );
      
     case CATEGORIES.SHAPES:
  return (
    <ShapeTools
      color={color}
      setColor={handleColorChange}  // Updated
      strokeWidth={strokeWidth}
      setStrokeWidth={setStrokeWidth}
      showColorPicker={showColorPicker}
      setShowColorPicker={setShowColorPicker}
      onAddShape={handleAddShape}
    />
  );
      
   case CATEGORIES.TEXT:
  return (
    <TextTools
      color={color}
      setColor={handleColorChange}
      fontSize={fontSize}
      setFontSize={handleFontSizeChange} // Changed from setFontSize to handleFontSizeChange
      showColorPicker={showColorPicker}
      setShowColorPicker={setShowColorPicker}
      onAddText={handleAddText}
    />
  );
      
     case CATEGORIES.TRANSFORM:
  return (
    <TransformTools
      activeTool={activeTool}
      canvas={canvasInstanceRef.current}
      onCrop={handleCrop}
      onRotate={handleRotate}
      onFlip={handleFlip}
      onConfirmCrop={handleConfirmCrop}
      setActiveTool={setActiveTool}
    />
  );
      
  //   case CATEGORIES.FILTERS:
  // return (
  //   <FilterTools
  //     brightness={brightness}
  //     setBrightness={setBrightness}
  //     contrast={contrast}
  //     setContrast={setContrast}
  //     saturation={saturation}
  //     setSaturation={setSaturation}
  //     onApplyFilters={handleApplyFilters} // Updated with the new function
  //     onResetFilters={handleResetFilters} // Updated with the new function
  //   />
  // );
      
      default:
        return null;
    }
  };

  

  return (
    <div className="flex flex-col md:flex-row w-full bg-white rounded-lg shadow-lg overflow-hidden h-[600px]">
      {/* Conditional rendering for desktop vs mobile */}
      {!isMobile ? (
        <>
          {/* Desktop Layout - keep your existing layout */}
          <ToolsSidebar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            toolComponent={renderToolComponent()}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopToolbar
              zoomLevel={zoomLevel}
              onZoom={handleZoom}
              onDownload={handleDownload}
              onSave={handleSave}
              onCancel={() => onSave(initialImageUrl)}
              isLoading={isLoading}
              isSaving={isSaving}
              hasError={!!errorMessage}
              isCoverEdit={isCoverEdit}
            />

            <CanvasArea
              canvasRef={canvasRef}
              canvasWrapperRef={canvasWrapperRef}
            />
          </div>
        </>
      ) : (
        <>
          {/* Mobile Layout */}
          <div className="flex-1 flex flex-col h-full">
            {/* Mobile Top Toolbar */}
            <div className="flex items-center justify-between p-2 border-b">
              <button 
                onClick={() => onSave(initialImageUrl)} 
                className="p-2 text-gray-600"
              >
                Cancel
              </button>
              
              <div className="flex items-center">
                <span className="text-sm font-medium mx-1">Zoom: {zoomLevel}%</span>
                <button 
                  onClick={() => handleZoom(Math.max(50, zoomLevel - 10))}
                  className="p-1 bg-gray-100 rounded-l-lg"
                >
                  -
                </button>
                <button 
                  onClick={() => handleZoom(Math.min(200, zoomLevel + 10))}
                  className="p-1 bg-gray-100 rounded-r-lg"
                >
                  +
                </button>
              </div>
              
              <button 
                onClick={handleSave}
                className="p-2 bg-purple-600 text-white rounded-lg text-sm"
              >
                {isCoverEdit ? "Update Cover" : "Apply"}
              </button>
            </div>
            
            {/* Canvas Area for Mobile */}
            <div className="flex-1 relative">
              <CanvasArea
                canvasRef={canvasRef}
                canvasWrapperRef={canvasWrapperRef}
              />
              
              {/* Mobile Tool Panel (slides up from bottom) */}
              {showMobileToolPanel && (
                <MobileToolPanel 
                  onClose={toggleMobileToolPanel}
                  activeCategory={activeCategory}
                >
                  {renderToolComponent()}
                </MobileToolPanel>
              )}
            </div>
            
            {/* Mobile Bottom Toolbar */}
            <MobileToolbar
              activeCategory={activeCategory}
              onSelectCategory={selectMobileCategory}
              onTogglePan={togglePanMode}
              isPanning={isPanning}
              onDownload={handleDownload}
            />
          </div>
        </>
      )}

      {/* Overlays - keep for both layouts */}
      {isLoading && <LoadingOverlay />}
      {errorMessage && (
        <ErrorOverlay
          isVisible={!!errorMessage}
          message={errorMessage}
          onClose={() => onSave(initialImageUrl)}
        />
      )}
    </div>
  );
};

export default CustomImageEditor;