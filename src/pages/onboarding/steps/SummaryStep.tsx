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
  const [rawTextContent, setRawTextContent] = useState<{[key: number]: string}>({});
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Parse summary when it changes
  useEffect(() => {
    if (summary) {
      try {
        // Clean the HTML string
        const cleanHtml = summary.replace(/```html|```/g, '').trim();
        setParsedSummary(cleanHtml);
        
        // Extract sections from HTML
        const extractedSections = extractSectionsFromHTML(cleanHtml);
        
        // Use extracted sections or default if none found
        const finalSections = extractedSections.length > 0 ? extractedSections : [
          { title: 'Introduction', content: '<p>Add your introduction here.</p>' },
          { title: 'Main Content', content: '<p>Describe your main content here.</p>' },
          { title: 'Conclusion', content: '<p>Add your conclusion here.</p>' }
        ];
        
        setSections(finalSections);
        
        // Initialize the raw text content for each section
        const initialRawContent: {[key: number]: string} = {};
        finalSections.forEach((section, index) => {
          initialRawContent[index] = convertHtmlToEditableText(section.content);
        });
        setRawTextContent(initialRawContent);
      } catch (error) {
        console.error("Error parsing summary HTML:", error);
        // Set default sections if parsing fails
        const defaultSections = [
          { title: 'Introduction', content: '<p>Add your introduction here.</p>' },
          { title: 'Main Content', content: '<p>Describe your main content here.</p>' },
          { title: 'Conclusion', content: '<p>Add your conclusion here.</p>' }
        ];
        setSections(defaultSections);
        
        // Initialize raw content for default sections
        const defaultRawContent: {[key: number]: string} = {};
        defaultSections.forEach((section, index) => {
          defaultRawContent[index] = convertHtmlToEditableText(section.content);
        });
        setRawTextContent(defaultRawContent);
      }
    }
  }, [summary]);

  // Extract sections from HTML helper
  const extractSectionsFromHTML = (html: string): SummarySection[] => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const sectionElements = tempDiv.querySelectorAll('.summary-section');
    const extractedSections: SummarySection[] = [];
    
    if (sectionElements.length > 0) {
      sectionElements.forEach(section => {
        const titleEl = section.querySelector('h2');
        const title = titleEl ? titleEl.textContent || '' : '';
        
        // Get all content except the h2
        let content = '';
        section.childNodes.forEach((node: any) => {
          if (node.nodeName !== 'H2') {
            content += node.outerHTML || '';
          }
        });
        
        extractedSections.push({ title, content });
      });
    } else {
      // Try to extract content from regular HTML structure if no specific sections found
      const h2Elements = tempDiv.querySelectorAll('h2');
      
      if (h2Elements.length > 0) {
        h2Elements.forEach((h2, index) => {
          const title = h2.textContent || '';
          let content = '';
          
          // Get content until next h2 or end
          let currentNode = h2.nextSibling as any;
          while (currentNode && (currentNode.nodeName !== 'H2')) {
            content += currentNode.outerHTML || '';
            currentNode = currentNode.nextSibling;
          }
          
          extractedSections.push({ title, content });
        });
      } else {
        // If no structure found, create a single section with all content
        extractedSections.push({ 
          title: 'Summary', 
          content: tempDiv.innerHTML 
        });
      }
    }
    
    return extractedSections;
  };

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
    try {
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
      
      // Update the parsed summary for display
      setParsedSummary(updatedHtml);
      
      // Call the parent's update function
      onUpdate(updatedHtml);
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving summary:', error);
      // Stay in edit mode if save fails
    }
  };

  const handleCancel = () => {
    // Reset raw text content based on current sections
    const resetRawContent: {[key: number]: string} = {};
    sections.forEach((section, index) => {
      resetRawContent[index] = convertHtmlToEditableText(section.content);
    });
    setRawTextContent(resetRawContent);
    
    // Exit edit mode
    setIsEditing(false);
  };

  // Download as PDF using jsPDF with text-only rendering
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
      
      // Add title
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", margin, y);
      y += 15;
      
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

  // Download as Word (docx)
  const downloadAsWord = async () => {
    try {
      setIsDownloading(true);
      setShowDownloadOptions(false);
      
      // Build docx document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 720, right: 720, bottom: 720, left: 720 },
              },
            },
            children: sections.map(section => [
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

  // Improved convertHtmlToEditableText function
  const convertHtmlToEditableText = (html: string) => {
    if (!html) return '';
    
    // Create a temporary element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Process the content
    let result = '';
    
    // Handle direct child nodes first
    Array.from(tempDiv.childNodes).forEach((node: any) => {
      // Handle different node types
      if (node.nodeType === Node.TEXT_NODE) {
        // Text node
        if (node.textContent.trim()) {
          result += node.textContent.trim() + '\n\n';
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Element node
        if (node.nodeName === 'P') {
          result += node.textContent + '\n\n';
        } else if (node.nodeName === 'UL') {
          Array.from(node.querySelectorAll('li')).forEach((item: any) => {
            result += '* ' + item.textContent + '\n';
          });
          result += '\n';
        } else if (node.nodeName === 'OL') {
          Array.from(node.querySelectorAll('li')).forEach((item: any, index: number) => {
            result += (index + 1) + '. ' + item.textContent + '\n';
          });
          result += '\n';
        } else if (node.nodeName === 'DIV' || node.nodeName === 'SECTION') {
          // For container elements, process their children recursively
          Array.from(node.childNodes).forEach((childNode: any) => {
            if (childNode.nodeType === Node.ELEMENT_NODE) {
              if (childNode.nodeName === 'P') {
                result += childNode.textContent + '\n\n';
              } else if (childNode.nodeName === 'UL') {
                Array.from(childNode.querySelectorAll('li')).forEach((item: any) => {
                  result += '* ' + item.textContent + '\n';
                });
                result += '\n';
              } else if (childNode.nodeName === 'OL') {
                Array.from(childNode.querySelectorAll('li')).forEach((item: any, index: number) => {
                  result += (index + 1) + '. ' + item.textContent + '\n';
                });
                result += '\n';
              } else if (childNode.textContent.trim()) {
                result += childNode.textContent.trim() + '\n\n';
              }
            } else if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent.trim()) {
              result += childNode.textContent.trim() + '\n\n';
            }
          });
        } else if (node.textContent.trim()) {
          result += node.textContent.trim() + '\n\n';
        }
      }
    });
    
    return result.trim();
  };

  // Improved convertTextToHtml function that properly handles lists
  const convertTextToHtml = (text: string) => {
    if (!text) return '<p></p>';
    
    // Split the text into lines
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    let listType = '';
    let paragraphText = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Handle empty lines
      if (!trimmedLine) {
        // If we were building a paragraph, close it
        if (paragraphText) {
          html += `<p>${paragraphText}</p>`;
          paragraphText = '';
        }
        
        // Close any open list
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
        }
        
        continue;
      }
      
      // Check for bullet points
      if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        // If we were building a paragraph, close it first
        if (paragraphText) {
          html += `<p>${paragraphText}</p>`;
          paragraphText = '';
        }
        
        const content = trimmedLine.substring(2);
        
        // Start a new list if not already in one
        if (!inList || listType !== 'ul') {
          if (inList) {
            html += listType === 'ul' ? '</ul>' : '</ol>';
          }
          html += '<ul>';
          listType = 'ul';
          inList = true;
        }
        
        html += `<li>${content}</li>`;
      }
      // Check for numbered lists
      else if (/^\d+\.\s/.test(trimmedLine)) {
        // If we were building a paragraph, close it first
        if (paragraphText) {
          html += `<p>${paragraphText}</p>`;
          paragraphText = '';
        }
        
        const content = trimmedLine.replace(/^\d+\.\s/, '');
        
        // Start a new list if not already in one
        if (!inList || listType !== 'ol') {
          if (inList) {
            html += listType === 'ul' ? '</ul>' : '</ol>';
          }
          html += '<ol>';
          listType = 'ol';
          inList = true;
        }
        
        html += `<li>${content}</li>`;
      }
      // Regular text
      else {
        // Close any open list
        if (inList) {
          html += listType === 'ul' ? '</ul>' : '</ol>';
          inList = false;
        }
        
        // Either add to existing paragraph or start a new one
        if (paragraphText) {
          paragraphText += ' ' + trimmedLine;
        } else {
          paragraphText = trimmedLine;
        }
        
        // If this is the last line or the next line is empty,
        // or the next line is a list item, close the paragraph
        if (i === lines.length - 1 || 
            !lines[i+1].trim() || 
            lines[i+1].trim().startsWith('* ') || 
            lines[i+1].trim().startsWith('- ') || 
            /^\d+\.\s/.test(lines[i+1].trim())) {
          html += `<p>${paragraphText}</p>`;
          paragraphText = '';
        }
      }
    }
    
    // Close any remaining paragraph
    if (paragraphText) {
      html += `<p>${paragraphText}</p>`;
    }
    
    // Close any open list at the end
    if (inList) {
      html += listType === 'ul' ? '</ul>' : '</ol>';
    }
    
    return html || '<p></p>';
  };

  // Handle text change in edit mode
  const handleTextChange = (index: number, text: string) => {
    // Update the raw text content
    const newRawContent = {...rawTextContent};
    newRawContent[index] = text;
    setRawTextContent(newRawContent);
    
    // Convert to HTML and update section content
    const formattedContent = convertTextToHtml(text);
    handleSectionUpdate(index, 'content', formattedContent);
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
          {sections?.map((section, index) => (
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
                  rows={8}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                  value={rawTextContent[index] || convertHtmlToEditableText(section.content)}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter text content. Use asterisks (*) at start of line for bullet points. Use numbers followed by period (1.) for numbered lists.
                </p>
              </div>
            </div>
          ))}
          
          {/* Add section button */}
          <div className="flex justify-between py-4">
            <button
              onClick={() => {
                // Add a new empty section
                setSections([...sections, { title: 'New Section', content: '<p>Add content here.</p>' }]);
                
                // Add raw text for the new section
                const newIndex = sections.length;
                setRawTextContent({
                  ...rawTextContent,
                  [newIndex]: 'Add content here.'
                });
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-md border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              + Add Section
            </button>
            
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
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden">
          <div 
            ref={summaryContentRef}
            className="prose prose-purple max-w-none p-6 summary-content"
            dangerouslySetInnerHTML={{ __html: parsedSummary }}
          />
          <div className="flex justify-end p-4 border-t border-gray-100">
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
          color: #374151; /* Make sure text appears black, not gray */
        }
        .summary-content ul, .summary-content ol {
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default SummaryStep;