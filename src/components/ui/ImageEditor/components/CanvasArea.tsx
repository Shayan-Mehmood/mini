import React, { useEffect } from 'react';

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasWrapperRef: React.RefObject<HTMLDivElement>;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ canvasRef, canvasWrapperRef }) => {
  useEffect(() => {
    // Debug canvas dimensions
    if (canvasRef.current && canvasWrapperRef.current) {
      const canvas = canvasRef.current;
      const wrapper = canvasWrapperRef.current;
      
      console.log('Canvas element dimensions:', {
        width: canvas.width,
        height: canvas.height,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
      });
      console.log('Wrapper dimensions:', {
        clientWidth: wrapper.clientWidth,
        clientHeight: wrapper.clientHeight,
      });
    }
  }, []);

  return (
    <div className="flex-1 relative bg-gray-50 overflow-hidden">
      <div 
        ref={canvasWrapperRef}
        className="w-full h-full flex items-center justify-center p-4"
        style={{ 
          minHeight: '400px',
          minWidth: '400px'
        }}
      >
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg shadow-sm bg-white"
          style={{ 
            display: 'block',
            maxWidth: '100%', 
            maxHeight: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default CanvasArea;