import React, { useState, useEffect, forwardRef, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import EditorStyles from './EditorStyles';
import EditorToolbar from './EditorToolbar';
import BlotFormatter2 from '@enzedonline/quill-blot-formatter2';
import { Save, Edit, Image, ChevronRight, FileText, PanelLeftOpen, Lightbulb, Loader2 } from 'lucide-react';
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
  onEnhanceText?: (selectedText: string, fullContent: string) => Promise<string>;
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
            return;
          }
        }
        
        setSelectedText('');
      };
      
      document.addEventListener('selectionchange', checkSelection);
      document.addEventListener('mouseup', checkSelection);
      
      return () => {
        document.removeEventListener('selectionchange', checkSelection);
        document.removeEventListener('mouseup', checkSelection);
      };
    }, [ref]);

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

    // Function to handle text enhancement with AI
    const handleEnhanceText = async () => {
      if (!onEnhanceText || !selectedText || isEnhancing) return;
      
      try {
        setIsEnhancing(true);
        
        // Get the current editor and selection
        if (!ref || !('current' in ref) || !ref.current) return;
        const editor = ref.current.getEditor();
        const selection = editor.getSelection();
        
        if (!selection) return;
        
        // Call the enhance text function passed from parent
        const enhancedText = await onEnhanceText(selectedText, content);
        
        // Replace the selected text with the enhanced text
        editor.deleteText(selection.index, selection.length);
        editor.insertText(selection.index, enhancedText);
        
        // Update the content state
        const updatedContent = editor.root.innerHTML;
        setContent(updatedContent);
        onContentChange(updatedContent);
        
        // Clear selection
        setSelectedText('');
        
      } catch (error) {
        console.error('Error enhancing text:', error);
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
            <div className=" fixed bottom-4 right-4 z-10">
              <Button
                onClick={handleEnhanceText}
                disabled={isEnhancing}
                className="bg-yellow-500 hover:bg-yellow-600  text-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
                title="Enhance selected text with AI"
              >
                {isEnhancing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Lightbulb className="h-5 w-5" />
                    <span className='text-[12px]'>Enhance Text</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;