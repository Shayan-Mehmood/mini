import React, { useState, useEffect, forwardRef, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import EditorStyles from './EditorStyles';
import EditorToolbar from './EditorToolbar';
import BlotFormatter2 from '@enzedonline/quill-blot-formatter2';
import { Save, Edit, Image, ChevronRight, FileText, PanelLeftOpen, Lightbulb, Loader2, RefreshCw, PlusCircle, Wand2 } from 'lucide-react';
import '../index.css';

// Register the BlotFormatter2 module with Quill
if (typeof window !== 'undefined') {
  const Quill = ReactQuill.Quill;
  // Make sure we only register once
  if (!Quill.imports['modules/blotFormatter2']) {
    Quill.register('modules/blotFormatter2', BlotFormatter2);
    console.log('BlotFormatter2 registered successfully');
  }
}

interface RichTextEditorProps {
  initialContent: string;
  imageUrl?: string | null;
  id: string | number;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onImageClick?: (imageUrl: string) => void;
  onEnhanceText?: (
    selectedText: string, 
    fullContent: string, 
    operation?: 'enhance' | 'rewrite' | 'addParagraph'
  ) => Promise<string>;
}

// Improved cleanHtmlContent function that preserves image attributes during resize
const cleanHtmlContent = (htmlContent: string): string => {
  // Existing code...
  if (!htmlContent) return htmlContent;
  
  if(typeof(htmlContent) === 'string'){
    var cleanedContent: any = htmlContent
      .replace(/<li><br><\/li>/g, '')
      .replace(/<li><p><br><\/p><\/li>/g, '')
      .replace(/<li>\s*<\/li>/g, '')
      .replace(/<ul>\s*<\/ul>/g, '')
      .replace(/<ol>\s*<\/ol>/g, '');
      
    // Only clean pre tags, don't touch images
    cleanedContent = cleanedContent.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, (match: any, content: any) => {
      return content;
    });
    
    // Only fix malformed image tags, don't remove them
    cleanedContent = cleanedContent.replace(/<img src=\\"([^"]*)\\" alt=\\"([^"]*)\\" class=\\"([^"]*)\\" width=\\"([^"]*)\\" height=\\"([^"]*)\\"\\>/g, 
      '<img src="$1" alt="$2" class="$3" width="$4" height="$5">');
    
    // Remove only escaped backslashes, not all backslashes
    cleanedContent = cleanedContent.replace(/\\"/g, '"');
    
    return cleanedContent;
  } else {
    return htmlContent;
  }
};

const RichTextEditor = forwardRef<ReactQuill, RichTextEditorProps>(
  ({ initialContent, imageUrl, id, onContentChange, onSave, onImageClick, onEnhanceText }, ref) => {
    const [content, setContent] = useState(() => cleanHtmlContent(initialContent));
    const isResizingRef = useRef(false);
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showPlaceholder, setShowPlaceholder] = useState(!initialContent);
    const skipContentUpdateRef = useRef(false);
    const contentBeforeResizeRef = useRef<string>('');
    const pendingContentRef = useRef<string | null>(null);
    
    // New state for text enhancement feature
    const [selectedText, setSelectedText] = useState<string>('');
    const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
    const [isAIMenuOpen, setIsAIMenuOpen] = useState<boolean>(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [selectionRange, setSelectionRange] = useState<{index: number, length: number} | null>(null);

    useEffect(() => {
      if (initialContent) {
        setContent(cleanHtmlContent(initialContent));
        setShowPlaceholder(false);
      } else {
        setShowPlaceholder(false);
      }
    }, [initialContent]);

    useEffect(() => {
      if (imageUrl && ref && 'current' in ref && ref.current) {
        // Existing code...
        const editor = ref.current.getEditor();
        const range = editor.getSelection();
        const index = range ? range.index : editor.getLength();
        editor.insertEmbed(index, 'image', imageUrl);
        editor.setSelection(index + 1);
      }
    }, [imageUrl, ref]);

    // Track text selection in the editor
    useEffect(() => {
      const checkSelection = () => {
        if (!ref || !('current' in ref) || !ref.current) return;
        
        const editor = ref.current.getEditor();
        const selection = editor.getSelection();
        
        if (selection && selection.length > 0) {
          const text = editor.getText(selection.index, selection.length);
          if (text.trim().length > 0) {
            setSelectedText(text);
            setSelectionRange(selection);
            return;
          }
        }
        
        setSelectedText('');
        setSelectionRange(null);
      };
      
      document.addEventListener('selectionchange', checkSelection);
      document.addEventListener('mouseup', checkSelection);
      
      return () => {
        document.removeEventListener('selectionchange', checkSelection);
        document.removeEventListener('mouseup', checkSelection);
      };
    }, [ref]);

    // Add a useEffect to handle clicks outside the popover
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (isAIMenuOpen && 
            popoverRef.current && 
            buttonRef.current && 
            !popoverRef.current.contains(event.target as Node) &&
            !buttonRef.current.contains(event.target as Node)) {
          setIsAIMenuOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isAIMenuOpen]);

    // Enhanced resize tracking - existing code...
    useEffect(() => {
      const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
        if (target.classList.contains('blot-formatter__resize-handle')) {
          // Store current content state before resize starts
          contentBeforeResizeRef.current = content;
          
          // Enable resize mode
          isResizingRef.current = true;
          skipContentUpdateRef.current = true;
          
          // Add resizing class to editor wrapper
          if (editorRef.current) {
            editorRef.current.classList.add('resizing');
          }
          
          // Prevent scroll interference
          document.body.style.overflow = 'hidden';
          
        } else if (target.tagName === 'IMG') {
          const imgSrc = (target as HTMLImageElement).src;
          setSelectedImage(imgSrc);
        } else {
          const isEditButton = target.closest('button') && 
            (target.closest('button')?.title?.includes('Edit') || 
             target.closest('button')?.innerHTML?.includes('Edit'));
          
          if (!isEditButton) {
            setSelectedImage(null);
          }
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (isResizingRef.current) {
          // Prevent browser default behaviors during resize
          e.preventDefault();
          e.stopPropagation();
        }
      };

      const handleMouseUp = () => {
        if (isResizingRef.current) {
          // Remove resizing class
          if (editorRef.current) {
            editorRef.current.classList.remove('resizing');
          }
          
          // Restore scroll behavior
          document.body.style.overflow = '';
          
          // Important: Update content with the current state after resize
          setTimeout(() => {
            isResizingRef.current = false;
            skipContentUpdateRef.current = false;
            
            // If we have pending content updates from resize, apply them now
            if (pendingContentRef.current) {
              setContent(pendingContentRef.current);
              onContentChange(pendingContentRef.current);
              pendingContentRef.current = null;
            } else if (ref && 'current' in ref && ref.current) {
              // Get the final state directly from Quill
              const finalContent = ref.current.getEditor().root.innerHTML;
              setContent(finalContent);
              onContentChange(finalContent);
            }
          }, 200);
        }
      };

      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.overflow = '';
      };
    }, [content, onContentChange]);

    const handleChange = (value: string) => {
      if (isResizingRef.current) {
        // During resize: Store the value but don't update state or call callbacks
        // This prevents React re-renders during resize operations
        pendingContentRef.current = value;
        return;
      }
      
      // Only clean and update content when not resizing
      const cleanedContent = cleanHtmlContent(value);
      setContent(cleanedContent);
      onContentChange(cleanedContent);
    };

  

    // Create a new function to handle different text operations
    const handleProcessText = async (operation: 'enhance' | 'rewrite' | 'addParagraph') => {
  if (!onEnhanceText || !selectedText || isEnhancing || !selectionRange) return;
  
  setIsAIMenuOpen(false);
  
  try {
    setIsEnhancing(true);
    
    // Get the current editor
    if (!ref || !('current' in ref) || !ref.current) return;
    const editor = ref.current.getEditor();
    
    // Call the enhance text function passed from parent, now passing the operation type
    // We use a custom property to pass the operation to the backend
    const processedText = await onEnhanceText(selectedText, content, operation);
    
    // Handle text differently based on operation
    if (operation === 'addParagraph') {
      // For add paragraph, insert after the selected text
      const insertIndex = selectionRange.index + selectionRange.length;
      editor.insertText(insertIndex, "\n\n" + processedText);
    } else {
      // For enhance/rewrite, replace the selected text
      editor.deleteText(selectionRange.index, selectionRange.length);
      editor.insertText(selectionRange.index, processedText);
    }
    
    // Update the content state
    const updatedContent = editor.root.innerHTML;
    setContent(updatedContent);
    onContentChange(updatedContent);
    
    // Clear selection
    setSelectedText('');
    setSelectionRange(null);
    
  } catch (error) {
    console.error(`Error processing text (${operation}):`, error);
  } finally {
    setIsEnhancing(false);
  }
};

    // Enhanced modules configuration - existing code...
    const modules = {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ font: [] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          [{ color: [] }, { background: [] }],
          [{ align: ['', 'center', 'right', 'justify'] }],
          ['link'],
          ['clean'],
        ],
      },
      blotFormatter2: {
        align: {
          allowAligning: false,
        },
        image: {
          allowAltTitleEdit: false
        },
        resize: {
          allowResize: true,
          handleStyle: {
            backgroundColor: 'transparent',
            border: '1px solid #ccc',
            borderRadius: '50%',
            width: '10px',
            height: '10px'
          },
          throttle: 0,
        },
        overlay: {
          className: 'blot-formatter__overlay',
          style: {
            position: 'absolute',
            boxSizing: 'border-box',
            border: 'none',
            backgroundColor: 'transparent'
          }
        }
      }, 
      clipboard: {
        matchVisual: false
      }
    };
    
    // Add CSS for editor styling - existing code...
    useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
        .resizing .ql-editor {
          user-select: none !important;
          pointer-events: none !important;
        }
        .resizing .blot-formatter__resize-handle {
          pointer-events: auto !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }, []);

    // Render placeholder - existing code...
    if (showPlaceholder) {
      return (
        <div className="flex flex-col mx-auto w-full h-full">
          <EditorStyles />
          
          <div className="border rounded-lg h-[calc(100vh-240px)] flex flex-col items-center justify-center bg-gray-50 text-center p-6">
            <div className="bg-white rounded-full p-4 shadow-md mb-6">
              <FileText className="h-12 w-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Chapter Selected</h3>
            <p className="text-gray-600 max-w-md mb-6">
              Please select a chapter from the side panel to start editing its content.
            </p>
          </div>
        </div>
      );
    }

    // Simplified image CORS fix - existing code...
    useEffect(() => {
      if (isResizingRef.current) {
        return; // Skip during resize
      }

      const timer = setTimeout(() => {
        const fixEditorImages = () => {
          if (!editorRef.current) return;
          
          const images = editorRef.current.querySelectorAll('img');
          images.forEach(img => {
            if (!img.hasAttribute('data-fixed')) {
              img.setAttribute('referrerPolicy', 'no-referrer');
              img.setAttribute('crossOrigin', 'anonymous');
              img.setAttribute('data-fixed', 'true');
              
              img.onerror = () => {
                if (!img.src.includes('?direct=true')) {
                  img.src = `${img.src}?direct=true`;
                }
              };
            }
          });
        };
        
        fixEditorImages();
      }, 100);

      return () => clearTimeout(timer);
    }, [content]);

    return (
      <div className="flex flex-col mx-auto w-full">
        <EditorStyles />
        
        <div className="flex justify-between items-center mb-3">
          <EditorToolbar editorRef={ref as React.RefObject<ReactQuill>} />
        </div>
        
        {selectedImage && (
          <div className="flex items-center justify-start mb-3">
            <Button
              onClick={() => {
                onImageClick && selectedImage && onImageClick(selectedImage);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-3 py-1.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
              title="Edit the selected image"
            >
              <Edit className="h-4 w-4" />
              <span className="text-sm">Edit Image</span>
            </Button>
          </div>
        )}
        
        <div className="editor-wrapper relative border rounded-lg overflow-visible" ref={editorRef}>
          <ReactQuill
            ref={ref}
            value={content}
            onChange={handleChange}
            modules={modules}
            theme="snow"
            preserveWhitespace
          />
          
          {/* AI Text Enhancement Button */}
          {selectedText && onEnhanceText && (
  <div className="fixed bottom-4 right-4 z-10">
    <div className="relative">
      <Button
        onClick={() => setIsAIMenuOpen(!isAIMenuOpen)}
        disabled={isEnhancing}
         className={`flex items-center justify-center rounded-full w-12 h-12 shadow-lg transition-all duration-200
          ${isEnhancing 
            ? 'bg-purple-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl'}`}
        title="AI Text Tools"
      >
        {isEnhancing ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <Wand2 className="h-5 w-5 text-white" />
        )}
        
      </Button>
      
      {/* AI Tools Popover */}
      {isAIMenuOpen && !isEnhancing && (
        <div 
          ref={popoverRef}
          className="absolute bottom-12 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in"
        >
          <div className="flex flex-col">
            <div className="bg-gradient-to-r from-purple-500 to-purple-400 text-white font-medium py-2 px-3">
              AI Text Tools
            </div>
            
            <div className="text-xs text-gray-500 px-3 py-2 border-b">
              Select an action for the highlighted text:
            </div>
            
            <button
              className="flex items-center px-3 py-3 hover:bg-gray-50 transition-colors duration-150 border-b w-full text-left"
              onClick={() => handleProcessText('enhance')}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 mr-3">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">Enhance</div>
                <div className="text-xs text-gray-500">Improve clarity and style</div>
              </div>
            </button>
            
            <button
              className="flex items-center px-3 py-3 hover:bg-gray-50 transition-colors duration-150 border-b w-full text-left"
              onClick={() => handleProcessText('rewrite')}
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
              onClick={() => handleProcessText('addParagraph')}
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
    </div>
  </div>
)}
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;