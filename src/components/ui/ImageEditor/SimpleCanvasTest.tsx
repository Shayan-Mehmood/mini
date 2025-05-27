import React, { useRef, useEffect, useState } from 'react';
import * as fabric from 'fabric';

interface SimpleCanvasTestProps {
  imageUrl: string;
}

const SimpleCanvasTest: React.FC<SimpleCanvasTestProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && canvasWrapperRef.current && !canvas) {
      try {
        console.log('=== INITIALIZING SIMPLE CANVAS TEST ===');
        
        const container = canvasWrapperRef.current;
        const canvasElement = canvasRef.current;
        
        // Get container dimensions
        const containerWidth = container.clientWidth || 800;
        const containerHeight = container.clientHeight || 600;
        
        console.log('Container dimensions:', containerWidth, 'x', containerHeight);
        
        // Set canvas element dimensions first
        canvasElement.width = containerWidth;
        canvasElement.height = containerHeight;
        canvasElement.style.width = `${containerWidth}px`;
        canvasElement.style.height = `${containerHeight}px`;
        
        // Verify canvas context is available
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get 2D context from canvas');
        }
        
        console.log('Canvas context verified');
        
        // Create Fabric.js canvas
        const fabricCanvas = new fabric.Canvas(canvasElement, {
          width: containerWidth,
          height: containerHeight,
          backgroundColor: '#f0f0f0',
        });
        
        // Verify fabric canvas was created properly
        if (!fabricCanvas.getElement()) {
          throw new Error('Fabric canvas element is null');
        }
        
        console.log('Fabric canvas created successfully');
        console.log('Fabric canvas dimensions:', fabricCanvas.getWidth(), 'x', fabricCanvas.getHeight());
        console.log('HTML canvas dimensions:', canvasElement.width, 'x', canvasElement.height);
        
        // Test canvas by drawing a simple shape
        const testRect = new fabric.Rect({
          left: 50,
          top: 50,
          width: 100,
          height: 100,
          fill: 'red',
        });
        
        fabricCanvas.add(testRect);
        fabricCanvas.renderAll();
        console.log('Test rectangle added successfully');
        
        setCanvas(fabricCanvas);
        setStatus('Canvas initialized successfully!');
        
        return () => {
          fabricCanvas.dispose();
        };
      } catch (error) {
        console.error('Error initializing canvas:', error);
        setStatus(`Canvas initialization failed: ${error}`);
      }
    }
  }, [canvas]);

  // Load image when canvas is ready
  useEffect(() => {
    if (canvas && imageUrl) {
      // Small delay to ensure canvas is fully ready
      setTimeout(() => {
        loadImage();
      }, 100);
    }
  }, [canvas, imageUrl]);

  const loadImage = async () => {
    if (!canvas) return;
    
    try {
      console.log('=== LOADING IMAGE ===');
      console.log('Image URL:', imageUrl);
      setStatus('Loading image...');
      
      // Verify canvas is still valid
      if (!canvas.getElement()) {
        throw new Error('Canvas element is not available');
      }
      
      // Method 1: Try direct loading
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          console.log('Image loaded successfully');
          console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          
          // Verify image loaded properly
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            throw new Error('Image has invalid dimensions');
          }
          
          // Create fabric image
          const fabricImg = new fabric.Image(img);
          
          // Verify fabric image was created
          if (!fabricImg.getElement()) {
            throw new Error('Failed to create fabric image');
          }
          
          console.log('Fabric image created successfully');
          
          // Clear canvas safely
          try {
            canvas.clear();
            console.log('Canvas cleared');
          } catch (clearError) {
            console.error('Error clearing canvas:', clearError);
            // Continue anyway
          }
          
          // Get canvas dimensions
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();
          
          console.log('Canvas dimensions for positioning:', canvasWidth, 'x', canvasHeight);
          
          // Calculate scale to fit image
          const scale = Math.min(
            (canvasWidth * 0.8) / img.naturalWidth,
            (canvasHeight * 0.8) / img.naturalHeight,
            1
          );
          
          console.log('Calculated scale:', scale);
          
          // Center and scale the image
          const left = (canvasWidth - img.naturalWidth * scale) / 2;
          const top = (canvasHeight - img.naturalHeight * scale) / 2;
          
          console.log('Image position:', left, top);
          
          fabricImg.set({
            left: left,
            top: top,
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false,
          });
          
          console.log('Image properties set');
          
          // Add to canvas
          canvas.add(fabricImg);
          console.log('Image added to canvas');
          
          // Force render
          canvas.renderAll();
          console.log('Canvas rendered');
          
          console.log('Image added to canvas successfully');
          console.log('Canvas objects:', canvas.getObjects().length);
          setStatus(`Image loaded successfully! Objects: ${canvas.getObjects().length}`);
          
        } catch (error) {
          console.error('Error processing loaded image:', error);
          setStatus(`Error processing image: ${error}`);
        }
      };
      
      img.onerror = (error) => {
        console.error('Error loading image:', error);
        setStatus('Failed to load image, trying fetch method...');
        
        // Try with fetch as fallback
        tryFetchMethod();
      };
      
      img.src = imageUrl;
      
    } catch (error) {
      console.error('Error in loadImage:', error);
      setStatus(`Error: ${error}`);
    }
  };

  const tryFetchMethod = async () => {
    try {
      console.log('Trying fetch method...');
      setStatus('Trying alternative loading method...');
      
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
          try {
            console.log('Fetch method - image loaded');
            
            const fabricImg = new fabric.Image(img);
            
            canvas!.clear();
            
            const canvasWidth = canvas!.getWidth();
            const canvasHeight = canvas!.getHeight();
            
            const scale = Math.min(
              (canvasWidth * 0.8) / img.naturalWidth,
              (canvasHeight * 0.8) / img.naturalHeight,
              1
            );
            
            fabricImg.set({
              left: (canvasWidth - img.naturalWidth * scale) / 2,
              top: (canvasHeight - img.naturalHeight * scale) / 2,
              scaleX: scale,
              scaleY: scale,
              selectable: false,
              evented: false,
            });
            
            canvas!.add(fabricImg);
            canvas!.renderAll();
            
            setStatus(`Image loaded via fetch! Objects: ${canvas!.getObjects().length}`);
            
            // Clean up
            URL.revokeObjectURL(objectUrl);
            
          } catch (error) {
            console.error('Error in fetch method:', error);
            setStatus(`Fetch method failed: ${error}`);
          }
        };
        
        img.onerror = () => {
          setStatus('Both loading methods failed');
          URL.revokeObjectURL(objectUrl);
        };
        
        img.src = objectUrl;
      } else {
        throw new Error(`Fetch failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Fetch method failed:', error);
      setStatus(`Fetch failed: ${error}`);
      tryDirectCanvasMethod();
    }
  };

  // Try drawing directly on canvas context as last resort
  const tryDirectCanvasMethod = async () => {
    try {
      console.log('Trying direct canvas context method...');
      setStatus('Trying direct canvas drawing...');
      
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
          try {
            const canvasElement = canvasRef.current;
            if (!canvasElement) throw new Error('Canvas element not found');
            
            const ctx = canvasElement.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');
            
            // Clear and draw background
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
            
            // Calculate scale and position
            const scale = Math.min(
              (canvasElement.width * 0.8) / img.naturalWidth,
              (canvasElement.height * 0.8) / img.naturalHeight,
              1
            );
            
            const scaledWidth = img.naturalWidth * scale;
            const scaledHeight = img.naturalHeight * scale;
            const left = (canvasElement.width - scaledWidth) / 2;
            const top = (canvasElement.height - scaledHeight) / 2;
            
            // Draw image
            ctx.drawImage(img, left, top, scaledWidth, scaledHeight);
            
            setStatus('Image drawn directly on canvas context!');
            URL.revokeObjectURL(objectUrl);
            
          } catch (error) {
            console.error('Direct canvas method failed:', error);
            setStatus(`All methods failed: ${error}`);
          }
        };
        
        img.onerror = () => {
          setStatus('All image loading methods failed');
          URL.revokeObjectURL(objectUrl);
        };
        
        img.src = objectUrl;
      }
    } catch (error) {
      console.error('Direct canvas method failed:', error);
      setStatus(`All methods failed: ${error}`);
    }
  };

  const debugCanvas = () => {
    if (!canvas) {
      console.log('No canvas available');
      return;
    }
    
    console.log('=== CANVAS DEBUG ===');
    console.log('Canvas dimensions:', canvas.getWidth(), 'x', canvas.getHeight());
    console.log('Objects count:', canvas.getObjects().length);
    console.log('Objects:', canvas.getObjects());
    
    if (canvasRef.current) {
      console.log('HTML Canvas:', {
        width: canvasRef.current.width,
        height: canvasRef.current.height,
        clientWidth: canvasRef.current.clientWidth,
        clientHeight: canvasRef.current.clientHeight,
      });
      
      const ctx = canvasRef.current.getContext('2d');
      console.log('Canvas context available:', !!ctx);
    }
    
    // Force render
    try {
      canvas.renderAll();
      console.log('Render successful');
    } catch (error) {
      console.error('Render failed:', error);
    }
  };

  return (
    <div className="w-full h-full p-4">
      <div className="mb-4 space-y-2">
        <h2 className="text-lg font-bold">Simple Canvas Test</h2>
        <p className="text-sm text-gray-600">Status: {status}</p>
        <div className="flex gap-2">
          <button
            onClick={debugCanvas}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Debug Canvas
          </button>
          <button
            onClick={loadImage}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Reload Image
          </button>
          <button
            onClick={tryDirectCanvasMethod}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm"
          >
            Try Direct Draw
          </button>
        </div>
      </div>
      
      <div 
        ref={canvasWrapperRef}
        className="w-full h-96 border-2 border-gray-300 rounded-lg bg-gray-100"
      >
        <canvas
          ref={canvasRef}
          className="block"
          style={{ border: '1px solid #ccc' }}
        />
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Image URL: {imageUrl}</p>
      </div>
    </div>
  );
};

export default SimpleCanvasTest;