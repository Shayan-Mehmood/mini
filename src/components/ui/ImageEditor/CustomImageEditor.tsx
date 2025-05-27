import React, { useRef, useState, useEffect } from 'react';
import * as fabric from 'fabric';
import { saveAs } from 'file-saver';

// Import smaller components
import ToolsSidebar from './components/ToolsSidebar';
import TopToolbar from './components/TopToolbar';
import CanvasArea from './components/CanvasArea';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorOverlay from './components/ErrorOverlay';
import { CATEGORIES, CategoryType } from './types';

// Import tool components
import SelectionTools from './tools/SelectionTools';
import DrawingTools from './tools/DrawingTools';
import ShapeTools from './tools/ShapeTools';
import TextTools from './tools/TextTools';
import TransformTools from './tools/TransformTools';
import FilterTools from './tools/FilterTools';

// Import utilities
import { 
  initializeCanvas,
  loadImageToCanvas,
  compressImage,
  base64ToBlob,
  getFilenameFromUrl,
  uploadToServer
} from './utils/imageEditorUtils';

interface CustomImageEditorProps {
  initialImageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

const CustomImageEditor: React.FC<CustomImageEditorProps> = ({ 
  initialImageUrl, 
  onSave 
}) => {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  
  // Core state
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryType>(CATEGORIES.SELECTION);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Tool state
  const [activeMode, setActiveMode] = useState<string>('select');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  
  // Style properties
  const [color, setColor] = useState('#4f46e5');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [fontSize, setFontSize] = useState(24);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Filter properties
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && canvasWrapperRef.current && !canvas) {
      try {
        console.log('🎨 Initializing canvas...');
        const fabricCanvas = initializeCanvas(
          canvasRef.current,
          canvasWrapperRef.current
        );
        
        console.log('✅ Canvas initialized:', fabricCanvas);
        console.log('📏 Canvas dimensions:', fabricCanvas.getWidth(), 'x', fabricCanvas.getHeight());
        
        setCanvas(fabricCanvas);

        return () => {
          try {
            window.removeEventListener('resize', () => {});
            fabricCanvas.dispose();
          } catch (error) {
            console.error('Error disposing canvas:', error);
          }
        };
      } catch (error) {
        console.error('❌ Error initializing canvas:', error);
        setErrorMessage('Failed to initialize editor. Please try refreshing the page.');
        setIsLoading(false);
      }
    }
  }, []); // Remove canvas dependency

  // Load initial image
  useEffect(() => {
    if (canvas && initialImageUrl) {
      console.log('🖼️ Loading image to canvas:', initialImageUrl);
      // Add a small delay to ensure canvas is ready
      setTimeout(() => {
        loadImageToCanvas(canvas, initialImageUrl, setIsLoading, setErrorMessage);
      }, 200);
    }
  }, [canvas, initialImageUrl]);

  // Add debug logging for canvas state
  useEffect(() => {
    if (!canvas) return;

    const logCanvasState = () => {
      console.log('🔍 Canvas Debug Info:');
      console.log('Canvas object:', canvas);
      console.log('Canvas dimensions:', canvas.getWidth(), 'x', canvas.getHeight());
      console.log('Canvas objects count:', canvas.getObjects().length);
      console.log('Canvas objects:', canvas.getObjects());
      console.log('Canvas background image:', canvas.backgroundImage);
      console.log('Canvas background color:', canvas.backgroundColor);
      
      // Log each object in detail with MORE properties
      canvas.getObjects().forEach((obj, index) => {
        console.log(`Object ${index} DETAILED:`, {
          type: obj.type,
          visible: obj.visible,
          opacity: obj.opacity,
          left: obj.left,
          top: obj.top,
          width: obj.width,
          height: obj.height,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
          flipX: obj.flipX,
          flipY: obj.flipY,
          // For image objects, check the source
          src: (obj as any).src || (obj as any)._element?.src || 'No src found',
          _element: (obj as any)._element,
          // Check if element is loaded
          complete: (obj as any)._element?.complete,
          naturalWidth: (obj as any)._element?.naturalWidth,
          naturalHeight: (obj as any)._element?.naturalHeight,
          // Check CSS properties
          canvas: obj.canvas,
          group: obj.group,
          clipPath: obj.clipPath,
          shadow: obj.shadow,
          // Full object for inspection
          fullObject: obj
        });

        // If it's an image, try to force a refresh
        if (obj.type === 'image') {
          console.log('🖼️ Found image object, attempting to refresh...');
          try {
            // Force the object to re-render
            obj.set({ dirty: true });
            obj.setCoords();
            canvas.renderAll();
            
            // Check if the image element exists and is loaded
            const imgElement = (obj as any)._element;
            if (imgElement) {
              console.log('📸 Image element details:', {
                src: imgElement.src,
                complete: imgElement.complete,
                naturalWidth: imgElement.naturalWidth,
                naturalHeight: imgElement.naturalHeight,
                width: imgElement.width,
                height: imgElement.height,
                crossOrigin: imgElement.crossOrigin,
                loading: imgElement.loading
              });
              
              // If image is not complete, try to reload it
              if (!imgElement.complete) {
                console.log('🔄 Image not loaded, attempting to reload...');
                const newImg = new Image();
                newImg.crossOrigin = 'anonymous';
                newImg.onload = () => {
                  console.log('✅ Image reloaded successfully');
                  (obj as any)._element = newImg;
                  canvas.renderAll();
                };
                newImg.onerror = (error) => {
                  console.error('❌ Failed to reload image:', error);
                };
                newImg.src = imgElement.src;
              }
            } else {
              console.log('❌ No image element found in fabric object');
            }
            
          } catch (error) {
            console.error('❌ Error while trying to refresh image:', error);
          }
        }
      });

      // Check if background image exists and log its properties
      if (canvas.backgroundImage) {
        console.log('Background Image Details:', {
          type: canvas.backgroundImage.type,
          src: (canvas.backgroundImage as any).src || (canvas.backgroundImage as any)._element?.src,
          width: canvas.backgroundImage.width,
          height: canvas.backgroundImage.height,
          scaleX: canvas.backgroundImage.scaleX,
          scaleY: canvas.backgroundImage.scaleY,
          visible: canvas.backgroundImage.visible,
          opacity: canvas.backgroundImage.opacity,
          object: canvas.backgroundImage
        });
      }

      // Check canvas DOM element
      const canvasElement = canvasRef.current;
      if (canvasElement) {
        console.log('🎯 Canvas DOM Element:', {
          width: canvasElement.width,
          height: canvasElement.height,
          style: canvasElement.style.cssText,
          offsetWidth: canvasElement.offsetWidth,
          offsetHeight: canvasElement.offsetHeight,
          clientWidth: canvasElement.clientWidth,
          clientHeight: canvasElement.clientHeight,
          visible: canvasElement.style.display !== 'none',
          opacity: canvasElement.style.opacity || 1
        });
      }

      // Check canvas wrapper
      const wrapperElement = canvasWrapperRef.current;
      if (wrapperElement) {
        console.log('📦 Canvas Wrapper:', {
          offsetWidth: wrapperElement.offsetWidth,
          offsetHeight: wrapperElement.offsetHeight,
          style: wrapperElement.style.cssText,
          className: wrapperElement.className
        });
      }
    };

    // Log immediately
    logCanvasState();

    // Set up interval to log canvas state every 5 seconds for debugging (increased interval)
    const interval = setInterval(logCanvasState, 5000);

    return () => clearInterval(interval);
  }, [canvas]);

  // Add a separate useEffect to force canvas refresh after image load
  useEffect(() => {
    if (!canvas) return;

    const forceCanvasRefresh = () => {
      console.log('🔄 Forcing canvas refresh...');
      try {
        canvas.getObjects().forEach(obj => {
          if (obj.type === 'image') {
            obj.set({ dirty: true });
            obj.setCoords();
          }
        });
        canvas.renderAll();
        console.log('✅ Canvas refresh completed');
      } catch (error) {
        console.error('❌ Error during canvas refresh:', error);
      }
    };

    // Force refresh after a delay
    const timeout = setTimeout(forceCanvasRefresh, 1000);
    
    return () => clearTimeout(timeout);
  }, [canvas, isLoading]); // Trigger when loading changes

  // Set up canvas event listeners
  useEffect(() => {
    if (!canvas) return;
    
    try {
      const handleSelection = (e: fabric.IEvent) => {
        const target = e.selected?.[0] || null;
        console.log('🎯 Object selected:', target);
        setSelectedObject(target);
      };
      
      const handleSelectionCleared = () => {
        console.log('🔄 Selection cleared');
        setSelectedObject(null);
      };

      const handleObjectAdded = (e: fabric.IEvent) => {
        console.log('➕ Object added to canvas:', e.target);
      };

      const handleObjectRemoved = (e: fabric.IEvent) => {
        console.log('➖ Object removed from canvas:', e.target);
      };

      const handleCanvasCleared = () => {
        console.log('🧹 Canvas cleared');
      };

      const handleAfterRender = () => {
        console.log('🎨 Canvas rendered');
      };
      
      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', handleSelectionCleared);
      canvas.on('object:added', handleObjectAdded);
      canvas.on('object:removed', handleObjectRemoved);
      canvas.on('canvas:cleared', handleCanvasCleared);
      canvas.on('after:render', handleAfterRender);
      
      return () => {
        try {
          canvas.off('selection:created', handleSelection);
          canvas.off('selection:updated', handleSelection);
          canvas.off('selection:cleared', handleSelectionCleared);
          canvas.off('object:added', handleObjectAdded);
          canvas.off('object:removed', handleObjectRemoved);
          canvas.off('canvas:cleared', handleCanvasCleared);
          canvas.off('after:render', handleAfterRender);
        } catch (error) {
          console.error('Error removing canvas event listeners:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up canvas event listeners:', error);
    }
  }, [canvas]);

  // Tool handlers
  const handleSelectMode = (): void => {
    if (!canvas) return;
    console.log('🔍 Switching to select mode');
    setActiveMode('select');
    setActiveTool(null);
    setActiveCategory(CATEGORIES.SELECTION);
    canvas.isDrawingMode = false;
  };

  const handleDrawingMode = (): void => {
    if (!canvas) return;
    console.log('✏️ Switching to drawing mode');
    setActiveMode('drawing');
    setActiveTool(null);
    setActiveCategory(CATEGORIES.DRAWING);
    canvas.isDrawingMode = true;
    
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = color;
      canvas.freeDrawingBrush.width = strokeWidth;
    }
  };

  const handleAddText = (): void => {
    if (!canvas) return;
    
    console.log('📝 Adding text to canvas');
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
    console.log('✅ Text added:', text);
  };

  const handleAddShape = (shape: string): void => {
    if (!canvas) return;
    
    console.log('🔸 Adding shape to canvas:', shape);
    let fabricObject: fabric.Object;
    
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
    console.log('✅ Shape added:', fabricObject);
  };

  const handleDeleteSelected = (): void => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      console.log('🗑️ Deleting selected object:', activeObject);
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const handleCrop = (): void => {
    if (!canvas) return;
    
    console.log('✂️ Starting crop operation');
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    const rect = new fabric.Rect({
      left: canvasWidth * 0.2,
      top: canvasHeight * 0.2,
      width: canvasWidth * 0.6,
      height: canvasHeight * 0.6,
      fill: 'transparent',
      stroke: '#00a0ff',
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      cornerColor: '#00a0ff',
      cornerStrokeColor: '#ffffff',
      cornerSize: 10,
      transparentCorners: false
    });
    
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
    
    setActiveTool('crop-confirm');
  };

  const handleConfirmCrop = (): void => {
    if (!canvas) return;
    
    console.log('✅ Confirming crop operation');
    const cropRect = canvas.getActiveObject() as fabric.Rect;
    if (!cropRect || !cropRect.left || !cropRect.top) return;
    
    const left = cropRect.left;
    const top = cropRect.top;
    const width = cropRect.getScaledWidth();
    const height = cropRect.getScaledHeight();
    
    const dataUrl = canvas.toDataURL({
      left,
      top,
      width,
      height,
      format: 'png'
    });
    
    const img = new Image();
    img.onload = (): void => {
      canvas.clear();
      
      fabric.Image.fromURL(dataUrl, (img: fabric.Image) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        canvas.renderAll();
        console.log('✅ Crop applied, new background image set');
      });
    };
    
    img.src = dataUrl;
    setActiveTool(null);
  };

  const handleRotate = (direction: 'left' | 'right'): void => {
    if (!canvas) return;
    
    console.log('🔄 Rotating canvas:', direction);
    const angle = direction === 'left' ? -90 : 90;
    const dataUrl = canvas.toDataURL();
    const img = new Image();
    
    img.onload = (): void => {
      const tempCanvas = document.createElement('canvas');
      if (angle === 90 || angle === -90) {
        tempCanvas.width = img.height;
        tempCanvas.height = img.width;
      } else {
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
      }
      
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.save();
      tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
      tempCtx.rotate((angle * Math.PI) / 180);
      tempCtx.drawImage(img, -img.width / 2, -img.height / 2);
      tempCtx.restore();
      
      canvas.clear();
      
      fabric.Image.fromURL(tempCanvas.toDataURL(), (img: fabric.Image) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        canvas.renderAll();
        console.log('✅ Rotation applied');
      });
    };
    
    img.src = dataUrl;
  };

  const handleFlip = (direction: 'horizontal' | 'vertical'): void => {
    if (!canvas) return;
    
    console.log('🔀 Flipping canvas:', direction);
    const dataUrl = canvas.toDataURL();
    const img = new Image();
    
    img.onload = (): void => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.save();
      if (direction === 'horizontal') {
        tempCtx.translate(tempCanvas.width, 0);
        tempCtx.scale(-1, 1);
      } else {
        tempCtx.translate(0, tempCanvas.height);
        tempCtx.scale(1, -1);
      }
      tempCtx.drawImage(img, 0, 0);
      tempCtx.restore();
      
      canvas.clear();
      
      fabric.Image.fromURL(tempCanvas.toDataURL(), (img: fabric.Image) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        canvas.renderAll();
        console.log('✅ Flip applied');
      });
    };
    
    img.src = dataUrl;
  };

  const handleApplyFilters = (): void => {
    if (!canvas) return;
    
    console.log('🎨 Applying filters:', { brightness, contrast, saturation });
    const dataUrl = canvas.toDataURL();
    const img = new Image();
    
    img.onload = (): void => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCtx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`;
      tempCtx.drawImage(img, 0, 0);
      
      canvas.clear();
      
      fabric.Image.fromURL(tempCanvas.toDataURL(), (img: fabric.Image) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
        canvas.renderAll();
        console.log('✅ Filters applied');
      });
      
      setBrightness(0);
      setContrast(0);
      setSaturation(0);
      setActiveTool(null);
    };
    
    img.src = dataUrl;
  };

  const handleResetFilters = (): void => {
    console.log('🔄 Resetting filters');
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
  };

  const handleZoom = (newZoom: number): void => {
    if (!canvas) return;
    console.log('🔍 Zooming to:', newZoom + '%');
    const center = canvas.getCenter();
    canvas.zoomToPoint(new fabric.Point(center.left, center.top), newZoom / 100);
    setZoomLevel(newZoom);
    canvas.renderAll();
  };

  const handleSave = async (): Promise<void> => {
    if (!canvas) return;
    
    try {
      console.log('💾 Starting save operation');
      setIsSaving(true);
      canvas.discardActiveObject();
      canvas.renderAll();
      
      const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
      console.log('📷 Canvas data URL generated');
      const compressedDataUrl = await compressImage(dataUrl);
      const newImageUrl = await uploadToServer(compressedDataUrl, initialImageUrl);
      
      console.log('✅ Image saved successfully:', newImageUrl);
      onSave(newImageUrl);
    } catch (error) {
      console.error('❌ Error saving image:', error);
      const dataUrl = canvas.toDataURL();
      onSave(dataUrl);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (): Promise<void> => {
    if (!canvas) return;
    
    console.log('📥 Starting download');
    canvas.discardActiveObject();
    canvas.renderAll();
    
    const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
    const blob = base64ToBlob(dataUrl);
    saveAs(blob, 'edited-image.jpg');
    console.log('✅ Download completed');
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
            onDrawingMode={handleDrawingMode}
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
            onAddShape={handleAddShape}
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
            onAddText={handleAddText}
          />
        );
      
      case CATEGORIES.TRANSFORM:
        return (
          <TransformTools
            activeTool={activeTool}
            canvas={canvas}
            onCrop={handleCrop}
            onRotate={handleRotate}
            onFlip={handleFlip}
            onConfirmCrop={handleConfirmCrop}
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
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full bg-white rounded-lg shadow-lg overflow-hidden h-[600px]">
      {/* Left Sidebar */}
      <ToolsSidebar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        toolComponent={renderToolComponent()}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <TopToolbar
          zoomLevel={zoomLevel}
          onZoom={handleZoom}
          onDownload={handleDownload}
          onSave={handleSave}
          onCancel={() => { void onSave(initialImageUrl); }}
          isLoading={isLoading}
          isSaving={isSaving}
          hasError={!!errorMessage}
        />

        {/* Canvas Area */}
        <CanvasArea
          canvasRef={canvasRef}
          canvasWrapperRef={canvasWrapperRef}
        />

        {/* Overlays */}
        {isLoading && <LoadingOverlay />}
        {errorMessage && (
          <ErrorOverlay
            isVisible={!!errorMessage}
            message={errorMessage}
            onClose={() => { void onSave(initialImageUrl); }}
          />
        )}
      </div>
    </div>
  );
};

export default CustomImageEditor;