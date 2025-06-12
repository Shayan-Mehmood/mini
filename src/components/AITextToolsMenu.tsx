import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Wand2, RefreshCw, PlusCircle } from 'lucide-react';

type AIOperation = 'enhance' | 'rewrite' | 'addParagraph';

interface AITextToolsMenuProps {
  selectedText: string;
  isProcessing: boolean;
  onProcessText: (operation: AIOperation) => Promise<void>;
}

const AITextToolsMenu: React.FC<AITextToolsMenuProps> = ({
  selectedText,
  isProcessing,
  onProcessText
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close the popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && 
          popoverRef.current && 
          buttonRef.current && 
          !popoverRef.current.contains(event.target as Node) &&
          !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Only show the menu when text is selected
  if (!selectedText) return null;

  const handleButtonClick = () => {
    if (!isProcessing) {
      setIsOpen(!isOpen);
    }
  };

  const handleOperationClick = (operation: AIOperation) => {
    setIsOpen(false);
    onProcessText(operation);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000]" style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
      <button 
        ref={buttonRef}
        disabled={isProcessing}
        onClick={handleButtonClick}
        className={`flex items-center justify-center rounded-full w-12 h-12 shadow-lg transition-all duration-200
          ${isProcessing 
            ? 'bg-purple-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl'}`}
        title="AI Text Tools"
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Wand2 className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Custom Popover */}
      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute bottom-14 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          style={{
            animation: 'fadeIn 0.2s ease-out forwards'
          }}
        >
          <div className="flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium py-2 px-3">
              AI Text Tools
            </div>
            
            <div className="text-xs text-gray-500 px-3 py-2 border-b">
              Select an action for the highlighted text:
            </div>
            
            <button
              className="flex items-center px-3 py-3 hover:bg-gray-50 transition-colors duration-150 border-b w-full text-left"
              disabled={isProcessing}
              onClick={() => handleOperationClick('enhance')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 mr-3">
                <Wand2 className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">Enhance</div>
                <div className="text-xs text-gray-500">Improve clarity and style</div>
              </div>
            </button>
            
            <button
              className="flex items-center px-3 py-3 hover:bg-gray-50 transition-colors duration-150 border-b w-full text-left"
              disabled={isProcessing}
              onClick={() => handleOperationClick('rewrite')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-3">
                <RefreshCw className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">Rewrite</div>
                <div className="text-xs text-gray-500">Completely rewrite text</div>
              </div>
            </button>
            
            <button
              className="flex items-center px-3 py-3 hover:bg-gray-50 transition-colors duration-150 w-full text-left"
              disabled={isProcessing}
              onClick={() => handleOperationClick('addParagraph')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mr-3">
                <PlusCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">Add Paragraph</div>
                <div className="text-xs text-gray-500">Expand with new content</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Add global styles for the animations */}
      <style >{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AITextToolsMenu;