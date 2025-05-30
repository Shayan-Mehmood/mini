import { useState, useEffect, useRef } from "react";
import { Edit, Save, X, Download, FileText, FileType } from "lucide-react";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

interface SummaryStepProps {
  summary: string;
  onUpdate: (updatedSummary: string) => void;
}

interface SummarySection {
  title: string;
  content: string;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ summary, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [parsedSummary, setParsedSummary] = useState<string>("");
  const [sections, setSections] = useState<SummarySection[]>([]);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (summary) {
      try {
        // Clean the HTML string
        const cleanHtml = summary.replace(/```html|```/g, '').trim();
        setParsedSummary(cleanHtml);
        
        // Extract sections from HTML (simple approach)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cleanHtml;
        
        const sectionElements = tempDiv.querySelectorAll('.summary-section');
        const extractedSections: SummarySection[] = [];
        
        sectionElements.forEach(section => {
          const titleEl = section.querySelector('h2');
          const title = titleEl ? titleEl.textContent || '' : '';
          
          // Get all content except the h2
          let content = '';
          section.childNodes.forEach((node:any) => {
            if (node.nodeName !== 'H2') {
              content += node.outerHTML || '';
            }
          });
          
          extractedSections.push({ title, content });
        });
        
        setSections(extractedSections.length > 0 ? extractedSections : [
          { title: 'Introduction', content: '<p>Add your introduction here.</p>' },
          { title: 'Main Content', content: '<p>Describe your main content here.</p>' },
          { title: 'Conclusion', content: '<p>Add your conclusion here.</p>' }
        ]);
      } catch (error) {
        console.error("Error parsing summary HTML:", error);
      }
    }
  }, [summary]);

  // Click outside handler for download menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDownloadOptions &&
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target as Node)
      ) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadOptions]);

  const handleSectionUpdate = (index: number, field: keyof SummarySection, value: string) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };

  const handleSave = () => {
    // Rebuild the HTML from our sections
    const updatedHtml = `
    <div class="summary-container">
      ${sections.map(section => `
        <div class="summary-section">
          <h2>${section.title}</h2>
          ${section.content}
        </div>
      `).join('')}
    </div>`;
    
    onUpdate(updatedHtml);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // Download as PDF using jsPDF with text-only rendering (no images)
  const downloadAsPDF = async () => {
    try {
      setIsDownloading(true);
      setShowDownloadOptions(false);
      
      // Create new PDF document
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20; // margin in mm
      const contentWidth = pageWidth - (margin * 2);
      
      // Set font
      doc.setFont("helvetica");
      doc.setTextColor(0, 0, 0); // Black text
      
      let y = margin; // Starting y position
      
      // For each section
      sections.forEach(section => {
        // Add section title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(section.title, margin, y);
        y += 10;
        
        // Add section content - strip HTML tags and split into lines
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        // Convert HTML content to plain text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = section.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        
        // Split text into lines that fit within page width
        const lines = doc.splitTextToSize(textContent, contentWidth);
        
        // Check if we need a new page
        if (y + (lines.length * 7) > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        
        // Add text with line spacing
        lines.forEach((line:any) => {
          doc.text(line, margin, y);
          y += 7; // Line height
          
          // Add new page if needed
          if (y >= pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
        });
        
        // Add spacing after section
        y += 10;
        
        // Add new page if needed
        if (y >= pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      });
      
      // Save the PDF
      doc.save('summary.pdf');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Download as Word (docx) - maintains current implementation but ensures no images
  const downloadAsWord = async () => {
    try {
      setIsDownloading(true);
      setShowDownloadOptions(false);
      
      // Parse sections for Word export
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = parsedSummary;
      const sectionElements = tempDiv.querySelectorAll('.summary-section');
      const docSections: SummarySection[] = [];
      
      sectionElements.forEach(section => {
        const titleEl = section.querySelector('h2');
        const title = titleEl ? titleEl.textContent || '' : '';
        let content = '';
        section.childNodes.forEach((node:any) => {
          if (node.nodeName !== 'H2') {
            content += node.outerHTML || '';
          }
        });
        docSections.push({ title, content });
      });
      
      // Build docx document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 720, right: 720, bottom: 720, left: 720 },
              },
            },
            children: docSections.map(section => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: section.title,
                    bold: true,
                    size: 28,
                    color: "000000" // Black text
                  })
                ],
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.LEFT,
                spacing: { after: 200 },
              }),
              ...section.content
                .replace(/<p>(.*?)<\/p>/g, '\n$1\n')
                .split(/\n+/)
                .filter(line => line.trim())
                .map(line => new Paragraph({
                  children: [
                    new TextRun({
                      text: line.replace(/<[^>]+>/g, ''),
                      font: 'Arial',
                      size: 24,
                      color: "000000" // Black text
                    })
                  ],
                  alignment: AlignmentType.JUSTIFIED,
                  spacing: { after: 120 },
                })),
            ]).flat(),
          },
        ],
      });
      
      // Generate and save the document
      const blob = await Packer.toBlob(doc);
      saveAs(blob, 'summary.docx');
    } catch (error) {
      console.error('Error downloading Word:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No summary available. Please go back and try again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with edit and download buttons */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800"></h3>
        <div className="flex gap-2">
          {!isEditing && (
            <div className="relative">
              <button 
                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md shadow-sm transition-colors hover:bg-gray-200"
                disabled={isDownloading}
              >
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                {isDownloading ? 'Downloading...' : 'Download'}
              </button>
              
              {showDownloadOptions && (
                <div 
                  ref={downloadMenuRef}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200 overflow-hidden"
                >
                  <button 
                    onClick={downloadAsPDF}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FileType className="w-4 h-4 text-red-500" />
                    Download as PDF
                  </button>
                  <button 
                    onClick={downloadAsWord}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    Download as Word
                  </button>
                </div>
              )}
            </div>
          )}
          
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-tr from-purple-600 to-purple-700 rounded-md shadow-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Summary
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleCancel}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md transition-colors hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm transition-colors hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary content */}
      {isEditing ? (
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">Section Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  value={section.title}
                  onChange={(e) => handleSectionUpdate(index, 'title', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Section Content</label>
                <textarea
                  rows={5}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  value={section.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}
                  onChange={(e) => {
                    // Wrap content in paragraph tags for simple formatting
                    const formattedContent = `<p>${e.target.value.replace(/\n\n/g, '</p><p>')}</p>`;
                    handleSectionUpdate(index, 'content', formattedContent);
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter plain text content. Use double line breaks to create new paragraphs.
                </p>
              </div>
            </div>
          ))}
          
          <div className="flex py-6 justify-end">
            <button 
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md shadow-sm transition-colors hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white overflow-hidden">
          <div 
            ref={summaryContentRef}
            className="prose prose-purple max-w-none p-6 summary-content"
            dangerouslySetInnerHTML={{ __html: parsedSummary }}
          />
          <div className="flex justify-end py-4">
            <button 
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-tr from-purple-600 to-purple-700 rounded-md shadow-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Summary
            </button>
          </div>
        </div>
      )}

      {/* Styling for the summary content */}
      <style>{`
        .summary-content .summary-section {
          margin-bottom: 1.5rem;
        }
        .summary-content h2 {
          color: #6b46c1;
          font-size: 1.25rem;
          margin-top: 0;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        .summary-content p, .summary-content li {
          margin-bottom: 0.75rem;
          line-height: 1.7;
        }
        .summary-content ul, .summary-content ol {
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default SummaryStep;