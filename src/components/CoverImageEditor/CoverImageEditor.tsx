import React, { useState, useEffect, useRef } from 'react';
import { Save, ZoomIn, ZoomOut, RotateCw, RotateCcw, Crop, Move, Check, Type, Lock, Unlock, Palette } from 'lucide-react';
import { Button } from '../ui/button';
import { Canvas, Image as FabricImage } from 'fabric';
import * as fabric from 'fabric';
import ColorPicker from '../ui/ImageEditor/components/ColorPicker'; // Import the ColorPicker component


interface CoverImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
}

const CoverImageEditor: React.FC<CoverImageEditorProps> = ({ imageUrl, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropRect, setCropRect] = useState<fabric.Rect | null>(null);
  const [mode, setMode] = useState<'move' | 'crop'>('move');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canvasInstanceRef = useRef<Canvas | null>(null);
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [showDimensionInputs, setShowDimensionInputs] = useState<boolean>(false);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(1);
  const [textColor, setTextColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextOptions, setShowTextOptions] = useState(false);
  
  // Check for mobile device
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add this useEffect to show text options when a text object is selected
useEffect(() => {
  if (!canvas) return;
  
  const handleSelectionCreated = (e: any) => {
    const selectedObject = e.selected?.[0];
    if (selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'text')) {
      setTextColor(selectedObject.fill);
      setShowTextOptions(true);
    } else {
      setShowTextOptions(false);
    }
  };
  
  const handleSelectionCleared = () => {
    setShowTextOptions(false);
  };
  
  canvas.on('selection:created', handleSelectionCreated);
  canvas.on('selection:updated', handleSelectionCreated);
  canvas.on('selection:cleared', handleSelectionCleared);
  
  return () => {
    canvas.off('selection:created', handleSelectionCreated);
    canvas.off('selection:updated', handleSelectionCreated);
    canvas.off('selection:cleared', handleSelectionCleared);
  };
}, [canvas]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !canvasContainerRef.current) return;

    const containerWidth = canvasContainerRef.current.clientWidth;
    const canvasHeight = Math.round(containerWidth * 0.6); // 5:3 aspect ratio for covers
    
    const canvasOptions = {
      width: containerWidth,
      height: canvasHeight,
      backgroundColor: '#f0f0f0',
      preserveObjectStacking: true
    };

    // Initialize canvas with Canvas from fabric
    const fabricCanvas = new fabric.Canvas(canvasRef.current!, canvasOptions);
    setCanvas(fabricCanvas);
    canvasInstanceRef.current = fabricCanvas;

    // Handle window resize
    const handleResize = () => {
      if (!canvasContainerRef.current || !fabricCanvas) return;
      const newWidth = canvasContainerRef.current.clientWidth;
      const newHeight = Math.round(newWidth * 0.6);
      
      // Only update canvas dimensions
      fabricCanvas.setDimensions({ width: newWidth, height: newHeight });
      
      // Center all objects after resize
      const objects = fabricCanvas.getObjects();
      if (objects.length > 0) {
        fabricCanvas.centerObject(objects[0]);
      }
      
      fabricCanvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    const loadImage = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      
      try {
        // Use FabricImage.fromURL with async/await pattern
        const img = await FabricImage.fromURL(imageUrl, {
          crossOrigin: 'anonymous',
        });
        
        // Get canvas dimensions
        const canvasWidth = fabricCanvas.getWidth();
        const canvasHeight = fabricCanvas.getHeight();
        
        // Get image dimensions
        const imgWidth = img.width ?? 100;
        const imgHeight = img.height ?? 100;
        
        // Store original aspect ratio
        const aspectRatio = imgWidth / imgHeight;
        setOriginalAspectRatio(aspectRatio);
        
        // Update dimension inputs with original image size
        setCustomWidth(Math.round(imgWidth).toString());
        setCustomHeight(Math.round(imgHeight).toString());
        
        // Calculate scaling to fit within canvas with padding
        const padding = isMobile ? 20 : 40; // Smaller padding on mobile
        const availableWidth = canvasWidth - padding;
        const availableHeight = canvasHeight - padding;
        
        const scaleX = availableWidth / imgWidth;
        const scaleY = availableHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY, 1);
        
        // Center the image
        img.set({
          left: canvasWidth / 2,
          top: canvasHeight / 2,
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          selectable: true,
          evented: true,
        });
        
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading image:', error);
        setErrorMessage("Failed to load image");
        setIsLoading(false);
      }
    };

    // Load the image
    loadImage();

    return () => {
      window.removeEventListener('resize', handleResize);
      fabricCanvas.dispose();
    };
  }, [imageUrl, isMobile]);

  // Add this method to your component
const handleColorChange = (newColor: string): void => {
  // Update the state
  setTextColor(newColor);

  const canvas = canvasInstanceRef.current;
  if (!canvas) return;

  // Apply color to currently selected text object
  const activeObject = canvas.getActiveObject();
  if (activeObject && (activeObject.type === 'i-text' || activeObject.type === 'text')) {
    activeObject.set('fill', newColor);
    canvas.renderAll();
  }
};

  // Handle dimensions change for the selected object
  const handleDimensionChange = () => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      alert("Please select an object first");
      return;
    }
    
    const width = parseInt(customWidth, 10);
    const height = parseInt(customHeight, 10);
    
    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
      alert("Please enter valid dimensions");
      return;
    }
    
    // Apply size limits to prevent performance issues
    const maxDimension = 2000;
    const safeWidth = Math.min(width, maxDimension);
    const safeHeight = Math.min(height, maxDimension);
    
    try {
      // Save current position and origin
      const origLeft = activeObject.left;
      const origTop = activeObject.top;
      const origScaleX = activeObject.scaleX || 1;
      const origScaleY = activeObject.scaleY || 1;
      const origWidth = activeObject.width || 100;
      const origHeight = activeObject.height || 100;
      
      // Calculate new scale factors
      const newScaleX = safeWidth / origWidth;
      const newScaleY = safeHeight / origHeight;
      
      // Apply scaling while keeping the object centered
      activeObject.set({
        scaleX: newScaleX,
        scaleY: newScaleY,
      });
      
      // Make sure object stays centered and within canvas
      canvas.centerObject(activeObject);
      canvas.requestRenderAll();
      
      // Update the state to reflect possibly clamped values
      setCustomWidth(safeWidth.toString());
      setCustomHeight(safeHeight.toString());
      
      // Close dimension inputs after applying
      setShowDimensionInputs(false);
      
    } catch (error) {
      console.error("Error applying dimensions:", error);
      alert("Failed to apply dimensions");
    }
  };

  // Handle width input change with aspect ratio preservation
  const handleWidthChange = (value: string) => {
    setCustomWidth(value);
    
    if (maintainAspectRatio && originalAspectRatio && value) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        const newHeight = Math.round(numValue / originalAspectRatio);
        setCustomHeight(newHeight.toString());
      }
    }
  };
  
  // Handle height input change with aspect ratio preservation
  const handleHeightChange = (value: string) => {
    setCustomHeight(value);
    
    if (maintainAspectRatio && originalAspectRatio && value) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        const newWidth = Math.round(numValue * originalAspectRatio);
        setCustomWidth(newWidth.toString());
      }
    }
  };

  // Zoom in/out
  const handleZoom = (zoomIn: boolean) => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    const delta = zoomIn ? 1.1 : 0.9;
    activeObject.scale(activeObject.scaleX! * delta);
    canvas.renderAll();
    
    // Update dimensions in inputs
    if (activeObject.width && activeObject.scaleX) {
      const newWidth = Math.round(activeObject.width * activeObject.scaleX);
      setCustomWidth(newWidth.toString());
    }
    
    if (activeObject.height && activeObject.scaleY) {
      const newHeight = Math.round(activeObject.height * activeObject.scaleY);
      setCustomHeight(newHeight.toString());
    }
    
    setZoomLevel(Math.round(zoomLevel * delta));
  };

  // Rotate image
  const handleRotate = (clockwise: boolean) => {
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (!activeObject) return;
    
    const angle = clockwise ? 90 : -90;
    activeObject.rotate!((activeObject.angle || 0) + angle);
    
    // If we're rotating by 90 or 270 degrees, swap width and height
    if ((Math.abs(activeObject.angle! % 180) > 45 && Math.abs(activeObject.angle! % 180) < 135)) {
      // Swap the custom width/height for the UI
      if (maintainAspectRatio) {
        const temp = customWidth;
        setCustomWidth(customHeight);
        setCustomHeight(temp);
      }
    }
    
    canvas.renderAll();
  };
const handleAddText = (): void => {
  const canvas = canvasInstanceRef.current as fabric.Canvas | null;
  if (!canvas) return;
  
  // Position text in the center of the canvas
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  
  const text = new fabric.IText('Double click to edit', {
    left: canvasWidth / 2,
    top: canvasHeight / 2,
    fontFamily: 'Arial',
    fontSize: 30,
    fill: textColor, // Use the textColor state
    textAlign: 'center',
    originX: 'center',
    originY: 'center',
    stroke: '#000000',
    strokeWidth: 0.5,
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.6)',
      blur: 3,
      offsetX: 1,
      offsetY: 1
    })
  });
  
  canvas.add(text);
  canvas.setActiveObject(text);
  canvas.renderAll();
  
  // Show text options when adding text
  setShowTextOptions(true);
};

  const handleSave = () => {
    if (!canvas) {
      console.error("Canvas instance not available");
      return;
    }
    
    try {
      // Make sure to deselect any active object to hide selection borders
      canvas.discardActiveObject();
      canvas.renderAll();
      
      // Get all objects on the canvas (image and any text)
      const objects = canvas.getObjects();
      if (objects.length === 0) {
        console.error("No objects found on canvas");
        return;
      }
      
      // Calculate the bounding box of all objects
      let left = Infinity;
      let top = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;
      
      objects.forEach(obj => {
        const objBounds = obj.getBoundingRect();
        left = Math.min(left, objBounds.left);
        top = Math.min(top, objBounds.top);
        right = Math.max(right, objBounds.left + objBounds.width);
        bottom = Math.max(bottom, objBounds.top + objBounds.height);
      });
      
      // Add a small padding
      const padding = 5;
      left = Math.max(0, left - padding);
      top = Math.max(0, top - padding);
      right = Math.min(canvas.width!, right + padding);
      bottom = Math.min(canvas.height!, bottom + padding);
      
      const width = right - left;
      const height = bottom - top;
      
      // Create a temporary canvas to draw only the content area
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        throw new Error("Could not get context from temporary canvas");
      }
      
      // Draw only the content portion of the original canvas to the temp canvas
      // Use the canvas's toDataURL to first get the full image data
      const fullDataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 2.0
      });
      
      // Create an image from the full data URL
      const img = new Image();
      img.src = fullDataUrl;
      
      // Wait for the image to load before cropping it
      img.onload = () => {
        // Draw the cropped portion to the temp canvas
        tempCtx.drawImage(
          img,
          left * 2, // Multiply by 2 because we used multiplier: 2.0
          top * 2,
          width * 2,
          height * 2,
          0, 0, width, height
        );
        
        // Get the final cropped data URL
        const croppedDataUrl = tempCanvas.toDataURL('image/png', 1.0);
        
        // Send the final edited image back to parent component
        onSave(croppedDataUrl);
      };
      
    } catch (error) {
      console.error('Error saving cover image:', error);
    }
  };



  return (
    <div className="flex flex-col w-full">
     <div className={`flex mb-4 justify-center ${isMobile ? 'sticky top-0 z-10 bg-white/95 py-2 shadow-sm' : ''}`}>
  <div className={`flex ${isMobile ? 'justify-between w-full px-1' : 'flex-wrap gap-2'}`}>
    {isMobile ? (
      // Mobile optimized toolbar (single row, icon-only)
      <div className="grid grid-cols-6 w-full gap-1">
        <Button 
          onClick={() => handleZoom(true)} 
          className="flex justify-center items-center bg-gray-50 hover:bg-gray-100 text-gray-700 h-9 px-2"
          disabled={isLoading}
          title="Zoom In"
          size="sm"
        >
          <ZoomIn size={16} />
        </Button>
        <Button 
          onClick={() => handleZoom(false)} 
          className="flex justify-center items-center bg-gray-50 hover:bg-gray-100 text-gray-700 h-9 px-2"
          disabled={isLoading}
          title="Zoom Out"
          size="sm"
        >
          <ZoomOut size={16} />
        </Button>
        <Button 
          onClick={() => handleRotate(true)} 
          className="flex justify-center items-center bg-gray-50 hover:bg-gray-100 text-gray-700 h-9 px-2"
          disabled={isLoading}
          title="Rotate Right"
          size="sm"
        >
          <RotateCw size={16} />
        </Button>
        <Button 
          onClick={() => handleRotate(false)} 
          className="flex justify-center items-center bg-gray-50 hover:bg-gray-100 text-gray-700 h-9 px-2"
          disabled={isLoading}
          title="Rotate Left"
          size="sm"
        >
          <RotateCcw size={16} />
        </Button>
        <Button 
          onClick={handleAddText} 
          className="flex justify-center items-center bg-gray-50 hover:bg-gray-100 text-gray-700 h-9 px-2"
          disabled={isLoading}
          title="Add Text"
          size="sm"
        >
          <Type size={16} />
        </Button>
        <Button 
          onClick={() => setShowDimensionInputs(!showDimensionInputs)} 
          className={`flex justify-center items-center h-9 px-2 ${showDimensionInputs ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
          disabled={isLoading}
          title="Resize Image"
          size="sm"
        >
          <Crop size={16} />
        </Button>
        {/* Add this to your toolbar buttons */}
<Button 
  onClick={() => setShowTextOptions(!showTextOptions)} 
  className={`flex items-center gap-1 ${showTextOptions ? 'bg-purple-100 hover:bg-purple-200 text-purple-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
  disabled={isLoading}
  title="Text Options"
>
  <Palette size={16} />
  <span>Text Options</span>
</Button>
      </div>
    ) : (
      // Desktop toolbar (with text labels)
      <>
        <Button 
          onClick={() => handleZoom(true)} 
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
          disabled={isLoading}
          title="Zoom In"
        >
          <ZoomIn size={16} />
          <span>Zoom In</span>
        </Button>
        <Button 
          onClick={() => handleZoom(false)} 
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
          disabled={isLoading}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
          <span>Zoom Out</span>
        </Button>
        <Button 
          onClick={() => handleRotate(true)} 
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
          disabled={isLoading}
          title="Rotate Right"
        >
          <RotateCw size={16} />
          <span>Rotate Right</span>
        </Button>
        <Button 
          onClick={() => handleRotate(false)} 
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
          disabled={isLoading}
          title="Rotate Left"
        >
          <RotateCcw size={16} />
          <span>Rotate Left</span>
        </Button>
        <Button 
          onClick={handleAddText} 
          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
          disabled={isLoading}
          title="Add Text"
        >
          <Type size={16} />
          <span>Text</span>
        </Button>
        <Button 
          onClick={() => setShowDimensionInputs(!showDimensionInputs)} 
          className={`flex items-center gap-1 ${showDimensionInputs ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-100 hover:bg-gray-200'} text-gray-700`}
          disabled={isLoading}
          title="Resize Image"
        >
          <Crop size={16} />
          <span>Resize Image</span>
        </Button>
      </>
    )}
  </div>
</div>

      {/* Dimensions input section */}
      {showDimensionInputs && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center justify-center bg-gray-50 p-3 rounded-md border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex items-center">
              <label htmlFor="width-input" className="mr-2 text-sm font-medium">Width:</label>
              <input
                id="width-input"
                type="number"
                min="50"
                max="2000"
                value={customWidth}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="p-1 border border-gray-300 rounded w-20 text-center"
              />
              <span className="ml-1 text-xs text-gray-500">px</span>
            </div>
            <div className="flex items-center">
              <label htmlFor="height-input" className="mr-2 text-sm font-medium">Height:</label>
              <input
                id="height-input"
                type="number"
                min="50"
                max="2000"
                value={customHeight}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="p-1 border border-gray-300 rounded w-20 text-center"
              />
              <span className="ml-1 text-xs text-gray-500">px</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                      className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700"

              title={maintainAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
            >
              {maintainAspectRatio ? <Lock size={14} /> : <Unlock size={14} />}
              <span className="text-xs">{maintainAspectRatio ? "Locked ratio" : "Unlocked"}</span>
            </Button>
            
            <Button 
              onClick={handleDimensionChange}
              className="bg-purple-500 hover:bg-purple-700 text-white"
              disabled={isLoading}
            >
              <Check size={16} className="mr-1" />
              Apply
            </Button>
          </div>
        </div>
      )}

      {/* Add this after your dimension inputs section */}
{showTextOptions && (
  <div className="flex mb-4 items-center justify-center bg-gray-50 p-2 rounded-md border border-gray-200">
      <Button 
        onClick={() => setShowTextOptions(false)}
        className="h-7 w-7 p-0 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300"
        size="sm"
      >
        <span className="text-gray-600 text-sm font-medium">×</span>
      </Button>
      
      <div className="flex-1 mx-2 max-w-[300px]">
        <ColorPicker
          color={textColor}
          setColor={handleColorChange}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          label=""
        />
      </div>
    </div>
)}

      {/* Canvas container */}
<div 
 ref={canvasContainerRef} 
  className="border border-gray-200 rounded-lg w-full relative overflow-hidden shadow-md transition-all duration-300"
  style={{ 
    height: isMobile ? 'calc(100vw * 0.6)' : 'min(540px, 75vh)',
    minHeight: isMobile ? '250px' : '300px',
    maxHeight: isMobile ? '60vh' : '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0'
  }}
>
 
  
  {/* Canvas element with better positioning */}
  <canvas 
  ref={canvasRef} 
      className="max-w-full max-h-full" 

  
/>
  
 
</div>
      
      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
          disabled={isLoading}
          title="Save Image"
        >
          <Save size={isMobile ? 18 : 16} />
          <span>Save Image</span>
        </Button>
      </div>
    </div>
  );
};

export default CoverImageEditor;