import * as fabric from 'fabric';
import axios from 'axios';

export const initializeCanvas = (
  canvasElement: HTMLCanvasElement,
  containerElement: HTMLDivElement
): fabric.Canvas => {
  const fabricCanvas = new fabric.Canvas(canvasElement, {
    preserveObjectStacking: true,
    selection: true,
    backgroundColor: '#ffffff',
    imageSmoothingEnabled: true,
  });

  const handleResize = () => {
    if (containerElement && fabricCanvas) {
      const containerWidth = containerElement.clientWidth;
      const containerHeight = containerElement.clientHeight;
      fabricCanvas.setWidth(containerWidth);
      fabricCanvas.setHeight(containerHeight);
      fabricCanvas.renderAll();
    }
  };

  window.addEventListener('resize', handleResize);
  handleResize();

  return fabricCanvas;
};

export const loadImageToCanvas = async (
  canvas: fabric.Canvas,
  imageUrl: string,
  setIsLoading: (loading: boolean) => void,
  setErrorMessage: (message: string | null) => void
) => {
  setIsLoading(true);
  setErrorMessage(null);

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    const imageLoaded = new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    img.src = imageUrl;
    await imageLoaded;

    const fabricImg = new fabric.Image(img);
    handleSuccessfulImageLoad(canvas, fabricImg);
    setIsLoading(false);
  } catch (error) {
    console.error('Error loading image:', error);
    setErrorMessage('Failed to load image. Please check the URL or try again.');
    setIsLoading(false);
  }
};

const handleSuccessfulImageLoad = (canvas: fabric.Canvas, img: fabric.Image) => {
  canvas.clear();
  
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const imgWidth = img.width || 0;
  const imgHeight = img.height || 0;
  
  const scaleX = (canvasWidth * 0.9) / imgWidth;
  const scaleY = (canvasHeight * 0.9) / imgHeight;
  const scale = Math.min(scaleX, scaleY);
  
  img.scale(scale);
  img.set({
    left: (canvasWidth - imgWidth * scale) / 2,
    top: (canvasHeight - imgHeight * scale) / 2,
    originX: 'left',
    originY: 'top',
    selectable: false,
    evented: false,
  });
  
  canvas.add(img);
  (canvas as any).setBackgroundImage(img, canvas.renderAll.bind(canvas));
  canvas.renderAll();
};

export const compressImage = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
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
      ctx?.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
  });
};

export const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = window.atob(parts[1]);
  const uInt8Array = new Uint8Array(raw.length);
  
  for (let i = 0; i < raw.length; i++) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
};

export const getFilenameFromUrl = (url: string): string => {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1].split('?')[0];
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
    });
    
    if (response.data.success) {
      return response.data.data.url;
    } else {
      throw new Error(response.data.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};