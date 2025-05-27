import { Canvas, Image as FabricImage, Rect, Circle, Triangle, IText, Object as FabricObject } from 'fabric';
import axios from 'axios';

export const initializeCanvas = (
  canvasElement: HTMLCanvasElement,
  containerElement: HTMLDivElement
): Canvas => {
  try {
    // Set initial dimensions from container
    const containerWidth = containerElement.clientWidth || 800;
    const containerHeight = containerElement.clientHeight || 600;
    
    console.log('Initializing canvas with dimensions:', containerWidth, 'x', containerHeight);
    
    // FORCE synchronize all canvas dimensions
    canvasElement.width = containerWidth;
    canvasElement.height = containerHeight;
    canvasElement.style.width = `${containerWidth}px`;
    canvasElement.style.height = `${containerHeight}px`;
    canvasElement.style.maxWidth = 'none';
    canvasElement.style.maxHeight = 'none';
    canvasElement.style.display = 'block';
    canvasElement.style.position = 'relative';
    
    const fabricCanvas = new Canvas(canvasElement, {
      preserveObjectStacking: true,
      selection: true,
      backgroundColor: '#ffffff',
      imageSmoothingEnabled: true,
      width: containerWidth,
      height: containerHeight,
    });

    // Verify canvas was created properly
    if (!fabricCanvas.getElement()) {
      throw new Error('Failed to create fabric canvas');
    }

    // FORCE re-sync dimensions after creation
    fabricCanvas.setWidth(containerWidth);
    fabricCanvas.setHeight(containerHeight);
    fabricCanvas.setDimensions({
      width: containerWidth,
      height: containerHeight
    });

    const handleResize = (): void => {
      try {
        if (containerElement && fabricCanvas && fabricCanvas.getElement()) {
          const containerWidth = containerElement.clientWidth;
          const containerHeight = containerElement.clientHeight;
          
          // Ensure minimum dimensions
          const width = Math.max(containerWidth, 400);
          const height = Math.max(containerHeight, 300);
          
          // Update canvas element dimensions
          canvasElement.width = width;
          canvasElement.height = height;
          canvasElement.style.width = `${width}px`;
          canvasElement.style.height = `${height}px`;
          
          fabricCanvas.setWidth(width);
          fabricCanvas.setHeight(height);
          fabricCanvas.setDimensions({ width, height });
          fabricCanvas.renderAll();
        }
      } catch (error) {
        console.error('Error in handleResize:', error);
      }
    };

    // Set up resize listener
    window.addEventListener('resize', handleResize);

    console.log('Canvas initialized successfully');
    return fabricCanvas;
    
  } catch (error) {
    console.error('Error initializing canvas:', error);
    throw error;
  }
};

export const loadImageToCanvas = async (
  canvas: Canvas,
  imageUrl: string,
  setIsLoading: (loading: boolean) => void,
  setErrorMessage: (message: string | null) => void
): Promise<void> => {
  setIsLoading(true);
  setErrorMessage(null);
  try {
    console.log('🖼️ Loading image using multiple methods:', imageUrl);
    
    // Clear canvas
    canvas.clear();
    
    // Get canvas dimensions
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    
    console.log('📏 Canvas dimensions:', canvasWidth, 'x', canvasHeight);
    
    // Try Method 1: Image.fromURL with Promise
    const loadWithFabricFromURL = (): Promise<void> => {
      return FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' })
        .then((img: FabricImage) => {
          processAndAddImage(canvas, img, canvas.getWidth(), canvas.getHeight());
          setIsLoading(false);
        });
    };
    
    // Try Method 2: Manual Image loading with CORS
    const loadWithManualCORS = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        console.log('🔄 Trying manual image loading with CORS...');
        
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
        
        img.onload = () => {
          try {
            console.log('✅ Manual CORS loading success');
            const fabricImg = new FabricImage(img);
            processAndAddImage(canvas, fabricImg, canvas.getWidth(), canvas.getHeight());
            setIsLoading(false);
            resolve();
          } catch (error) {
            console.error('❌ Error processing manually loaded image:', error);
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          console.error('❌ Manual CORS loading failed:', error);
          reject(new Error('Manual CORS loading failed'));
        };
        
        img.src = imageUrl;
        
        // Add timeout
        setTimeout(() => {
          reject(new Error('Manual CORS loading timeout'));
        }, 10000);
      });
    };
    
    // Try Method 3: Proxy through our server
    const loadWithProxy = (): Promise<void> => {
      return FabricImage.fromURL(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`, { crossOrigin: 'anonymous' })
        .then((img: FabricImage) => {
          processAndAddImage(canvas, img, canvas.getWidth(), canvas.getHeight());
          setIsLoading(false);
        });
    };
    
    // Try methods in sequence
    try {
      await loadWithFabricFromURL();
    } catch (error1) {
      console.warn('Method 1 failed, trying method 2:', error1);
      try {
        await loadWithManualCORS();
      } catch (error2) {
        console.warn('Method 2 failed, trying method 3:', error2);
        try {
          await loadWithProxy();
        } catch (error3) {
          console.error('All methods failed:', { error1, error2, error3 });
          setErrorMessage('Failed to load image. CORS or network issues detected.');
          setIsLoading(false);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error in loadImageToCanvas:', error);
    setErrorMessage('Failed to load image. Please check the URL or try again.');
    setIsLoading(false);
  }
};

const processAndAddImage = (
  canvas: Canvas,
  img: FabricImage,
  canvasWidth: number,
  canvasHeight: number
): void => {
  try {
    const imgWidth = img.width || 0;
    const imgHeight = img.height || 0;
    
    console.log('📐 Image dimensions:', imgWidth, 'x', imgHeight);
    
    if (imgWidth === 0 || imgHeight === 0) {
      throw new Error('Invalid image dimensions');
    }
    
    // Calculate scale to fit image in canvas
    const padding = 20;
    const availableWidth = canvasWidth - padding;
    const availableHeight = canvasHeight - padding;
    
    const scaleX = availableWidth / imgWidth;
    const scaleY = availableHeight / imgHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    // Center the image
    const left = (canvasWidth - imgWidth * scale) / 2;
    const top = (canvasHeight - imgHeight * scale) / 2;
    
    console.log('🔍 Calculated positioning:', {
      scale,
      left,
      top,
      availableWidth,
      availableHeight
    });
    
    // Set image properties
    img.set({
      left: left,
      top: top,
      scaleX: scale,
      scaleY: scale,
      selectable: true,
      evented: true,
      visible: true,
      opacity: 1,
      // Add red border for debugging
      stroke: '#ff0000',
      strokeWidth: 3
    });
    
    console.log('🖼️ Image properties set:', {
      left: img.left,
      top: img.top,
      scaleX: img.scaleX,
      scaleY: img.scaleY,
      width: img.width,
      height: img.height,
      visible: img.visible,
      opacity: img.opacity
    });
    
    // Add the image to the canvas
    canvas.add(img as unknown as FabricObject);
    
    // Make it the active object
    canvas.setActiveObject(img as unknown as FabricObject);
    
    // Re-render the canvas to display the image
    canvas.renderAll();
    
    console.log('✅ Image added to canvas successfully');
    console.log('📊 Canvas has', canvas.getObjects().length, 'objects');
    
  } catch (error) {
    console.error('❌ Error in processAndAddImage:', error);
    throw error;
  }
};

export const compressImage = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.src = dataUrl;
    img.onload = (): void => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = (MAX_WIDTH / width) * height;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (MAX_HEIGHT / height) * width;
          height = MAX_HEIGHT;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (error) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
  });
};

export const base64ToBlob = (base64: string): Blob => {
  try {
    const parts = base64.split(';base64,');
    const contentType = parts[0]?.split(':')[1] || 'image/jpeg';
    const raw = window.atob(parts[1] || '');
    const uInt8Array = new Uint8Array(raw.length);
    
    for (let i = 0; i < raw.length; i++) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
  } catch (error) {
    console.error('Error converting base64 to blob:', error);
    return new Blob([], { type: 'image/jpeg' });
  }
};

export const getFilenameFromUrl = (url: string): string => {
  try {
    const urlParts = url.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    return lastPart?.split('?')[0] || 'image';
  } catch (error) {
    console.error('Error getting filename from URL:', error);
    return 'image';
  }
};

export const uploadToServer = async (
  imageBase64: string, 
  originalUrl: string
): Promise<string> => {
  try {
    const originalFilename = getFilenameFromUrl(originalUrl);
    const formData = new FormData();
    const blob = base64ToBlob(imageBase64);
    
    formData.append('file', blob, originalFilename);
    formData.append('originalUrl', originalUrl);
    formData.append('override', 'true');
    
    const response = await axios.post('/api/cloudflare/upload/override', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    
    if (response.status === 200) {
      console.log('✅ Upload successful:', response.data);
      return response.data.url || response.data.key || '';
    } else {
      console.error('❌ Upload failed with status:', response.status, response.statusText);
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('❌ Error in uploadToServer:', error);
    throw error;
  }
};