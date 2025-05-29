import React from 'react';
import { useMediaQuery } from 'react-responsive';

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  canvasWrapperRef: React.RefObject<HTMLDivElement>;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ canvasRef, canvasWrapperRef }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  
  return (
    <div className="flex-1 relative bg-gray-50 overflow-hidden">
      <div 
        ref={canvasWrapperRef}
        className="w-full h-full flex items-center justify-center p-4"
        style={{ 
          minHeight: isMobile ? '300px' : '400px',
          touchAction: 'none', // Prevent browser handling of touch events
        }}
      >
        <canvas ref={canvasRef} className="touch-none" />
      </div>
      
      {isMobile && (
        <div className="absolute bottom-16 right-4 opacity-70">
          <div className="text-xs bg-gray-800 text-white p-2 rounded-lg">
            Pinch to zoom, use Pan tool to move
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasArea;