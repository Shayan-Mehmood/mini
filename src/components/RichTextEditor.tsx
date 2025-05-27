import React, { useState, useEffect, forwardRef, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from './ui/button';
import EditorStyles from './EditorStyles';
import EditorToolbar from './EditorToolbar';
import BlotFormatter2 from '@enzedonline/quill-blot-formatter2';
import { Save, Edit, Image, ChevronRight, FileText, PanelLeftOpen } from 'lucide-react';
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
}

// Improved cleanHtmlContent function that preserves image attributes during resize
const cleanHtmlContent = (htmlContent: string, isResizing: boolean = false): string => {
  if (!htmlContent) return htmlContent;
  
  // Skip cleaning during resize operations to preserve image data
  if (isResizing) {
    return htmlContent;
  }
  
  if(typeof(htmlContent) === 'string'){
    var cleanedContent: any = htmlContent
      .replace(/<li><br><\/li>/g, '')
      .replace(/<li><p><br><\/p><\/li>/g, '')
      .replace(/<li>\s*<\/li>/g, '')
      .replace(/<ul>\s*<\/ul>/g, '')
      .replace(/<ol>\s*<\/ol>/g, '');
      
    // Only clean pre tags, don't touch images during normal operations
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
  ({ initialContent, imageUrl, id, onContentChange, onSave, onImageClick }, ref) => {
    const [content, setContent] = useState(() => cleanHtmlContent(initialContent));
    const isResizingRef = useRef(false);
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showPlaceholder, setShowPlaceholder] = useState(!initialContent);
    const skipCleaningRef = useRef(false);

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
        const editor = ref.current.getEditor();
        const range = editor.getSelection();
        const index = range ? range.index : editor.getLength();
        editor.insertEmbed(index, 'image', imageUrl);
        editor.setSelection(index + 1);
      }
    }, [imageUrl, ref]);

    // Enhanced resize tracking
    useEffect(() => {
      const handleMouseDown = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        
        if (target.classList.contains('blot-formatter__resize-handle')) {
          isResizingRef.current = true;
          skipCleaningRef.current = true;
          
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
          
          // Restore scroll
          document.body.style.overflow = '';
          
          // Delay before allowing cleaning again
          setTimeout(() => {
            isResizingRef.current = false;
            skipCleaningRef.current = false;
          }, 200); // Increased delay
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
    }, []);

    const handleChange = (value: string) => {
      // Skip cleaning during resize operations
      if (skipCleaningRef.current || isResizingRef.current) {
        setContent(value);
        onContentChange(value);
        return;
      }
      
      // Clean content only when not resizing
      const cleanedContent = cleanHtmlContent(value, isResizingRef.current);
      setContent(cleanedContent);
      onContentChange(cleanedContent);
    };

    // Enhanced modules configuration
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
          ['link', 'image', 'video'],
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
            backgroundColor: '#8b5cf6',
            border: '2px solid white',
            borderRadius: '50%',
            width: '14px',
            height: '14px'
          },
          throttle: 0, // Remove throttling for smoother resize
        },
        overlay: {
          className: 'blot-formatter__overlay',
          style: {
            position: 'absolute',
            boxSizing: 'border-box',
            border: '2px solid #8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)'
          }
        }
      }, 
      clipboard: {
        matchVisual: false
      }
    };

    // Render placeholder
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

    useEffect(() => {
      const handleFocusOut = (e: FocusEvent) => {
        const editorEl = editorRef.current;
        if (editorEl && !isResizingRef.current) {
          // Only save when not resizing
          console.log('Saving content...');
          // onSave();
        }
      };

      window.addEventListener('blur', handleFocusOut, true);
      return () => window.removeEventListener('blur', handleFocusOut, true);
    }, [content, onSave]);

    // Simplified image CORS fix - only run once after content stabilizes
    useEffect(() => {
      if (isResizingRef.current || skipCleaningRef.current) {
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
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;