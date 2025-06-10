import { PDFDocument, StandardFonts, rgb, PDFPage } from "pdf-lib";
import { marked } from "marked";
import apiService from "../service/api";
import toast from "react-hot-toast";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  LevelFormat,
} from "docx";


// Add utility function to fetch images
const fetchImage = async (url: string): Promise<{ buffer: ArrayBuffer; type: string } | null> => {
  try {
    const cleanUrl = url
      .replace(/\\\\/g, '')
      .replace(/\\"/g, '')
      .replace(/^"|"$/g, '');

    console.log('Fetching image from:', cleanUrl);

    // Add no-cors mode and referrerPolicy for broader compatibility
   const response = await fetch(cleanUrl, {
  mode: 'cors',
  referrerPolicy: 'no-referrer',
});

    // If mode: 'no-cors', response.ok is always false and you can't access body, so fallback:
    if (!response || (response.status && !response.ok)) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }


    // Get content type from response
    const contentType = response.headers.get('content-type') || '';
    const buffer = await response.arrayBuffer();

    console.log("image buffer", buffer)
    return {
      buffer,
      type: contentType.toLowerCase()
    };

  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

const parseThisShit = (content:any) => {
  let parsedContent;
  try {
    parsedContent = JSON.parse(content);
    return parsedContent
  } catch (e) {
    parsedContent = content
      .split('","')
      .map((ch:any) => ch.replace(/^"|"$/g, "").replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\n/g, '\n').replace(/\s+/g, ' ') .trim());
    return parsedContent
  }
};

const processCoverPage = async (
  page: PDFPage,
  chapter: string,
  pdfDoc: PDFDocument,
  title: string
) => {
  console.log("...............................title", title);

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(chapter, 'text/html');
    const coverImage = doc.querySelector('.book-cover-image');
    if (!coverImage) return false;

    // Ensure we have a title
    const displayTitle = title || "Untitled Document";

    // Fetch and embed image
    const imgSrc = coverImage.getAttribute('src')?.replace(/&amp;/g, '&');
    if (!imgSrc) return false;
    const imageData = await fetchImage(imgSrc);
    if (!imageData) return false;
    let image;
    if (imageData.type.includes('png')) {
      image = await pdfDoc.embedPng(imageData.buffer);
    } else if (imageData.type.includes('jpeg') || imageData.type.includes('jpg')) {
      image = await pdfDoc.embedJpg(imageData.buffer);
    }
    if (!image) return false;

    // Fonts
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

    // Get page dimensions
    const { width: pageWidth, height: pageHeight } = page.getSize();

    // Draw image at top third of page
    const imgDims = image.scale(1);
    const scaledWidth = pageWidth * 0.4;
    const scaledHeight = pageHeight * 0.4 * (imgDims.height / imgDims.width);
    const imageX = (pageWidth - scaledWidth) / 2;
    const imageY = pageHeight * 0.25; // Increased from 0.65 to 0.75 (higher placement)
    
    page.drawImage(image, {
      x: imageX,
      y: imageY,
      width: scaledWidth,
      height: scaledHeight
    });

    // // Draw title in middle of page (direct approach)
    console.log("Drawing title:", displayTitle);
    page.drawText(displayTitle, {
      x: 100,
      y: pageHeight * 0.4,
      size: 24,
      font: timesBoldFont,
      color: rgb(0, 0, 0),
    });

    // Draw date at bottom
    const dateText = new Date().toLocaleDateString();
    page.drawText(dateText, {
      x: (pageWidth - timesRomanFont.widthOfTextAtSize(dateText, 12)) / 2,
      y: pageHeight * 0.2,
      size: 12,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    return true;
  } catch (error) {
    console.error("Error processing cover page:", error);
    return false;
  }
};

const pdfConfig = {
  pageWidth: 595,
  pageHeight: 842,
  margin: 50,
  lineSpacing: 24,
  paragraphSpacing: 12, // Reduced from 20 to 12
  headerSpacing: 30,
  chapterSpacing: 50,
  imageMaxWidth: 495, // pageWidth - 2 * margin
  get maxWidth() { return this.pageWidth - (2 * this.margin); },
  fonts: {
    h1: { size: 24, spacing: 30 },
    h2: { size: 20, spacing: 25 },
    h3: { size: 18, spacing: 20 },
    p: { size: 12, spacing: 12 }, // Reduced from 16 to 12
    list: { size: 12, spacing: 12, indent: 20 } // Reduced from 14 to 12
  }
};

const cleanHtmlContent = (html: string) => {
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

// Shared content processing function
const processContentForDownload = async (row: any) => {
  console.log("Original Content:", row.Content);

  // Parse and clean content
  let chapters = [];
  try {
    // Remove escaped characters and clean JSON
    const cleanedContent = row.Content
      .replace(/^"|"$/g, '')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .replace(/\\n/g, '\n')
      .replace(/\[\\"|\\"]/g, '"')
      .replace(/"{2,}/g, '"');

    // Parse content
    let parsedContent;
    try {
      parsedContent = JSON.parse(cleanedContent);
    } catch (e) {
      console.log("First parse failed, trying alternative:", e);
      parsedContent = cleanedContent.split('","').map((ch: any) => 
        ch.replace(/^"|"$/g, '')
      );
    }

    chapters = Array.isArray(parsedContent) ? parsedContent : [parsedContent];
  } catch (error) {
    console.error("Content parsing error:", error);
    throw error;
  }

  // Process chapters and extract cover
  let hasCover = false;
  let coverData = null;
  
  const coverIndex = chapters.findIndex((ch: any) =>
    typeof ch === 'string' && (
      ch.includes('book-cover-image') || 
      ch.includes('data-cover="true"')
    ) || (
      typeof ch === 'object' && ch.content && (
        ch.content.includes('book-cover-image') ||
        ch.content.includes('data-cover="true"')
      )
    )
  );

  // Extract cover if found
  if (coverIndex >= 0) {
    const parser = new DOMParser();
    const chapterContent = typeof chapters[coverIndex] === 'object' && chapters[coverIndex].content 
      ? chapters[coverIndex].content 
      : chapters[coverIndex];
    const doc = parser.parseFromString(chapterContent, 'text/html');
    
    // Find the cover image using multiple selectors
    const coverImage = doc.querySelector('.book-cover-image') || 
                       doc.querySelector('img') || 
                       doc.querySelector('p.ql-align-center img');
                       
    if (coverImage && coverImage.getAttribute('src')) {
      coverData = {
        src: coverImage.getAttribute('src'),
        content: chapterContent
      };
      hasCover = true;
      // Remove the cover chapter since we processed it
      chapters.splice(coverIndex, 1);
    } else {
      // Found a cover chapter but no image, so just remove it
      chapters.splice(coverIndex, 1);
    }
  }

  return {
    chapters,
    hasCover,
    coverData,
    courseTitle: row["Course Title"] || "Untitled Course"
  };
};

// Helper function to convert base64 to ArrayBuffer (browser-compatible)
function base64ToArrayBuffer(base64: string): ArrayBuffer | null {
  try {
    // Clean the base64 string
    const cleanBase64 = base64.replace(/\s/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
    
    if (!cleanBase64) {
      console.error('Empty base64 string');
      return null;
    }
    
    console.log('Converting base64 to buffer, length:', cleanBase64.length);
    
    const binaryString = window.atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('Successfully converted base64, buffer size:', bytes.buffer.byteLength);
    return bytes.buffer;
  } catch (error) {
    console.error('Error converting base64 to ArrayBuffer:', error);
    return null;
  }
}

// Helper: fetch image and convert to array buffer
async function fetchImageBuffer(url: string) {
  try {
    console.log('📸 Attempting to fetch image:', url.substring(0, 150) + '...');
    
    // Clean the URL
    let cleanUrl = url.replace(/&amp;/g, "&").trim();
    console.log(cleanUrl, "cleanUrl")
    // Check if it's a base64 image
    if (cleanUrl.startsWith('data:image/')) {
      console.log('🔢 Processing as base64 image');
      const base64Data = cleanUrl.split(',')[1];
      if (base64Data) {
        console.log('🔢 Converting base64 image to buffer, length:', base64Data.length);
        const buffer = base64ToArrayBuffer(base64Data);
        if (buffer) {
          console.log('✅ Base64 conversion successful, size:', buffer.byteLength);
          return buffer;
        } else {
          console.log('❌ Base64 conversion failed');
          return null;
        }
      } else {
        console.log('❌ No base64 data found in data URL');
        return null;
      }
    }else{
      cleanUrl = cleanUrl.trim().replace(/^\"|\\?\s*\"?$/g, '');
      const {buffer,type} = await fetchImage(cleanUrl) as any;
      if(buffer){
        console.log('✅ Successfully fetched image', buffer.byteLength);
        return buffer;
      }else{
        console.log('❌ Failed to fetch image');
        return null;
      }
    }
    
  } catch (err) {
    console.error('❌ Error fetching image:', url.substring(0, 100), err);
    return null;
  }
}

export const downloadItem = async (row: any, setLoading: any, format: 'pdf' | 'docx' = 'pdf') => {
  if (!row?.Content) {
    console.error("No content to download");
    return;
  }

  try {
    setLoading(true);
    
    // Process content (shared between PDF and DOCX)
    const processedContent = await processContentForDownload(row);
    
    if (format === 'docx') {
      await generateDocx(processedContent, setLoading);
    } else {
      await generatePdf(processedContent, setLoading);
    }

  } catch (error) {
    console.error(`${format.toUpperCase()} generation error:`, error);
    toast.error(`Error generating ${format.toUpperCase()}`);
  } finally {
    setLoading(false);
  }
};

// Generate DOCX from processed content
const generateDocx = async (processedContent: any, setLoading: any) => {
  const { chapters, hasCover, coverData, courseTitle } = processedContent;
  
  let sections = [];

  // --- TITLE PAGE ---
  sections.push({
    properties: {
      page: {
        margin: {
          top: 1440, // 1 inch = 1440 twips
          right: 1440,
          bottom: 1440,
          left: 1440,
        },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph("")],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                children: [PageNumber.CURRENT],
                size: 20,
              }),
            ],
          }),
        ],
      }),
    },
    children: [
      new Paragraph({
        text: "Mini Lesson Academy",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        run: {
          size: 48,
          color: "650AAA",
          bold: true,
        },
      }),
      new Paragraph({
        text: courseTitle,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 400 },
        run: {
          size: 36,
          bold: true,
        },
      }),
      new Paragraph({
        text: new Date().toLocaleDateString(),
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
        run: {
          size: 24,
          color: "666666",
        },
      }),
    ],
  });

  // --- COVER PAGE ---
  if (hasCover && coverData) {
    console.log('Processing cover for DOCX...');
    try {
      const coverBuffer = await fetchImageBuffer(coverData.src);
      
      if (coverBuffer && coverBuffer.byteLength > 0) {
        sections.push({
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          headers: {
            default: new Header({
              children: [new Paragraph("")],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      size: 20,
                    }),
                  ],
                }),
              ],
            }),
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 2000, after: 1000 },
              children: [
                new ImageRun({
                  data: coverBuffer,
                  type: "png", // Assuming PNG, could be determined from image type
                  transformation: {
                    width: 450,
                    height: 300,
                  },
                }),
              ],
            }),
          ],
        });
        console.log('✅ Cover image added to DOCX');
      }
    } catch (error) {
      console.error('❌ Error processing cover for DOCX:', error);
    }
  }

  // --- PROCESS CHAPTERS ---
  for (let i = 0; i < chapters.length; i++) {
    console.log(`Processing chapter ${i + 1} for DOCX`);
    
    let chapterHtml = typeof chapters[i] === "object" ? chapters[i].content || "" : chapters[i];
    let children = [];

    // Parse HTML content using DOMParser for better extraction
    const parser = new DOMParser();
    const doc = parser.parseFromString(chapterHtml, 'text/html');
    
    // Process all elements in order
    const allElements = doc.body.querySelectorAll('*');
    let processedImages = new Set();
    
    for (const element of allElements) {
      const tagName = element.tagName.toLowerCase();
      const textContent = element.textContent?.trim() || '';
      
      // Skip empty elements and already processed content
      if (!textContent && tagName !== 'img') continue;
      
      switch (tagName) {
        case 'h1':
          children.push(
            new Paragraph({
              text: textContent,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
              run: {
                size: 32,
                bold: true,
                color: "2C3E50",
              },
            })
          );
          break;

        case 'h2':
          children.push(
            new Paragraph({
              text: textContent,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 },
              run: {
                size: 26,
                bold: true,
                color: "34495E",
              },
            })
          );
          break;

        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          children.push(
            new Paragraph({
              text: textContent,
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 250, after: 120 },
              run: {
                size: 22,
                bold: true,
                color: "5D6D7E",
              },
            })
          );
          break;

        case 'p':
          if (textContent) {
            // Check for formatting within paragraph
            const hasStrong = element.querySelector('strong') !== null;
            const hasEm = element.querySelector('em') !== null;
            
            children.push(
              new Paragraph({
                text: textContent,
                spacing: { before: 120, after: 120 },
                run: {
                  size: 22,
                  bold: hasStrong,
                  italics: hasEm,
                },
              })
            );
          }
          break;

        case 'ul':
        case 'ol':
          const listItems = element.querySelectorAll('li');
          listItems.forEach((li, index) => {
            const listText = li.textContent?.trim() || '';
            if (listText) {
              children.push(
                new Paragraph({
                  text: listText,
                  bullet: {
                    level: 0,
                  },
                  spacing: { before: 80, after: 80 },
                  run: {
                    size: 22,
                  },
                })
              );
            }
          });
          break;

        case 'img':
          const imgSrc = element.getAttribute('src');
          if (imgSrc && !processedImages.has(imgSrc)) {
            processedImages.add(imgSrc);
            console.log(`Processing image for DOCX: ${imgSrc.substring(0, 100)}...`);
      
            try {
              const imgBuffer = await fetchImageBuffer(imgSrc);
              if (imgBuffer && imgBuffer.byteLength > 0) {
                children.push(
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                    children: [
                      new ImageRun({
                        data: imgBuffer,
                        type: "png", // Assuming PNG, could be determined from image type
                        transformation: {
                          width: 400,
                          height: 250,
                        },
                      }),
                    ],
                  })
                );
                console.log(`✅ Image added to DOCX successfully (${imgBuffer.byteLength} bytes)`);
              } else {
                console.log(`❌ Failed to fetch image, adding placeholder`);
                children.push(
                  new Paragraph({
                    text: "[Image could not be loaded]",
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 200 },
                    run: {
                      italics: true,
                      color: "999999",
                      size: 20,
                    },
                  })
                );
              }
            } catch (error) {
              console.error(`❌ Error processing image:`, error);
              children.push(
                new Paragraph({
                  text: "[Image processing error]",
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 200 },
                  run: {
                    italics: true,
                    color: "FF0000",
                    size: 20,
                  },
                })
              );
            }
          }
          break;
      }
    }

    // Add chapter as a new section with page numbers
    sections.push({
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph("")],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 20,
                }),
              ],
            }),
          ],
        }),
      },
      children: children.length > 0 ? children : [
        new Paragraph({
          text: `Chapter ${i + 1}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          text: "",
          run: {
            italics: true,
            color: "999999",
          },
        }),
      ],
    });
  }

  // Create and download DOCX
  const doc = new Document({
    creator: "Mini Lessons Academy",
    title: courseTitle,
    description: "Auto-generated course document",
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          basedOn: "Normal",
          next: "Normal",
          run: {
            size: 22,
            font: "Calibri",
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
            },
          },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "my-crazy-numbering",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 260 },
                },
              },
            },
          ],
        },
      ],
    },
    sections,
  });

  const buffer = await Packer.toBlob(doc);
  
  const link = document.createElement("a");
  link.href = URL.createObjectURL(buffer);
  link.download = `${courseTitle}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success("DOCX downloaded successfully");
};

// Generate PDF from processed content (your existing PDF logic)
const generatePdf = async (processedContent: any, setLoading: any) => {
  const { chapters, hasCover, coverData, courseTitle } = processedContent;

  // Create PDF document with NO pages initially
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // --- CREATE TITLE PAGE (FIRST PAGE) ---
  const titlePage = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
  const { width: pageWidth, height: pageHeight } = titlePage.getSize();
  
  // Draw "Mini Lesson Academy" title centered on first page
  const titleText = "Mini Lesson Academy";
  const titleFontSize = 32;
  const titleWidth = timesBoldFont.widthOfTextAtSize(titleText, titleFontSize);
  
  titlePage.drawText(titleText, {
    x: (pageWidth - titleWidth) / 2,
    y: pageHeight * 0.6, // Position it above center
    size: titleFontSize,
    font: timesBoldFont,
    color: rgb(0.39, 0.04, 0.67), // Purple color (#650AAA)
  });

  // Draw course title below the main title
  const courseTitleLines = splitTextIntoLines(courseTitle, timesBoldFont, 22, pdfConfig.maxWidth * 0.8);
  
  let courseTitleY = pageHeight * 0.5;
  courseTitleLines.forEach(line => {
    const lineWidth = timesBoldFont.widthOfTextAtSize(line, 22);
    titlePage.drawText(line, {
      x: (pageWidth - lineWidth) / 2,
      y: courseTitleY,
      size: 22,
      font: timesBoldFont,
      color: rgb(0, 0, 0),
    });
    courseTitleY -= 22 * 1.7; // Increased spacing here
  });

  // Draw date at bottom
  const dateText = new Date().toLocaleDateString();
  titlePage.drawText(dateText, {
    x: (pageWidth - timesRomanFont.widthOfTextAtSize(dateText, 12)) / 2,
    y: pageHeight * 0.1,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // --- COVER PAGE ---
  if (hasCover && coverData) {
    console.log('Processing cover for PDF...');
    try {
      // Add cover page as the SECOND page
      const coverPage = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
      const coverSuccess = await processCoverPage(coverPage, coverData.content, pdfDoc, courseTitle);
      
      if (!coverSuccess) {
        // If cover processing failed, remove the page
        pdfDoc.removePage(1); // Remove the second page (index 1)
      }
    } catch (error) {
      console.error('❌ Error processing cover for PDF:', error);
    }
  }

  // --- IMPROVED TEXT WRAPPING FUNCTION ---
  const drawWrappedText = (text: string, font: any, fontSize: number, startX: number, startY: number, currentPage: PDFPage, indent = 0) => {
    if (!text || text.trim() === '') return { y: startY, page: currentPage };
    
    const words = text.trim().split(' ');
    let currentLine = '';
    let currentY = startY;
    let page = currentPage;

    // Calculate line height based on font size - INCREASED for better spacing
    const lineHeight = fontSize * 1.6; // Increased from 1.3 to 1.6

    const drawLine = (line: string, y: number) => {
      if (!line.trim()) return y;
      
      // Don't draw text if it would be off-page - increased margin
      if (y < pdfConfig.margin + fontSize + 5) {
        return y;
      }
      
      page.drawText(line.trim(), {
        x: startX + indent,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      
      // Return the position after drawing the line with increased spacing
      return y - lineHeight;
    };

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (lineWidth > pdfConfig.maxWidth - indent) {
        // Draw current line and move down
        currentY = drawLine(currentLine, currentY);
        currentLine = word;

        // Check if we need a new page - increase threshold for new page
        if (currentY < pdfConfig.margin + fontSize + 10) {
          const newPage = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
          page = newPage;
          currentY = page.getSize().height - pdfConfig.margin;
        }
      } else {
        currentLine = testLine;
      }
    }

    // Draw the last line if there is one
    if (currentLine.trim()) {
      currentY = drawLine(currentLine, currentY);
    }

    // Add some extra space after text block
    currentY -= fontSize * 0.3;

    return { y: currentY, page };
  };

  // --- PROCESS CHAPTERS WITH ENHANCED FORMATTING ---
  let currentPage = null;
  let currentY = 0;
  
  for (let i = 0; i < chapters.length; i++) {
    console.log(`Processing chapter ${i + 1} for PDF`);
    
    // Create a new page for each chapter
    const chapterPage = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
    currentPage = chapterPage;
    currentY = chapterPage.getSize().height - pdfConfig.margin;
    
    // Process chapter content
    try {
      const parser = new DOMParser();
      const chapterContent = cleanHtmlContent(chapters[i]);
      const doc = parser.parseFromString(chapterContent, 'text/html');

      // Add chapter spacing
      currentY -= pdfConfig.chapterSpacing;

      // Find main elements to process
      const elements = doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, img');
      
      if (elements.length === 0) {
        // If this chapter has no content, remove the page to avoid empty pages
        pdfDoc.removePage(pdfDoc.getPageCount() - 1);
        continue;
      }
      
      for (const element of elements) {
        const tagName = element.tagName.toLowerCase();
        
        // Estimate element height for page break calculation - INCREASED heights
        let estimatedElementHeight = 0;
        if (tagName === 'img') {
          estimatedElementHeight = 450; // Increased estimate for images
        } else if (tagName.startsWith('h')) {
          estimatedElementHeight = 50; // Increased estimate for headings
        } else {
          estimatedElementHeight = 20; // Increased estimate for paragraphs/lists
        }
        
        // Create a new page if this element likely won't fit
        if (currentY - estimatedElementHeight < pdfConfig.margin) {
          const newPage = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
          currentPage = newPage;
          currentY = newPage.getSize().height - pdfConfig.margin;
        }

        // Process the element based on its type
        if (tagName === 'img') {
          // Handle images
          const imgSrc = element.getAttribute('src')?.replace(/&amp;/g, '&');
          if (imgSrc) {
            try {
              console.log('Processing image for PDF:', imgSrc.substring(0, 100) + '...');
              const imageData = await fetchImage(imgSrc);
              
              if (imageData) {
                let image;
                try {
                  // Embed image based on type
                  if (imageData.type.includes('png')) {
                    image = await pdfDoc.embedPng(imageData.buffer);
                  } else if (imageData.type.includes('jpeg') || imageData.type.includes('jpg')) {
                    image = await pdfDoc.embedJpg(imageData.buffer);
                  } else {
                    throw new Error('Unsupported image type: ' + imageData.type);
                  }

                  // Calculate image dimensions
                  const maxWidth = pdfConfig.maxWidth * 0.8;
                  const imgDims = image.scale(1);
                  let imgWidth = imgDims.width;
                  let imgHeight = imgDims.height;

                  // Scale down if too large
                  if (imgWidth > maxWidth) {
                    const scale = maxWidth / imgWidth;
                    imgWidth = maxWidth;
                    imgHeight = imgHeight * scale;
                  }

                  // Check if image fits on current page
                  if (currentY - imgHeight - 20 < pdfConfig.margin) {
                    const newPage = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
                    currentPage = newPage;
                    currentY = newPage.getSize().height - pdfConfig.margin;
                  }

                  // Center image
                  const xOffset = (currentPage.getSize().width - imgWidth) / 2;
                  
                  // Add spacing before image
                  currentY -= pdfConfig.lineSpacing;
                  
                  // Draw image
                  currentPage.drawImage(image, {
                    x: xOffset,
                    y: currentY - imgHeight,
                    width: imgWidth,
                    height: imgHeight,
                  });

                  // Update position after image with INCREASED spacing
                  currentY = currentY - imgHeight - pdfConfig.paragraphSpacing - 15;
                  
                  console.log('✅ Image added to PDF successfully');
                } catch (embedError) {
                  console.error('❌ Error embedding image:', embedError);
                  // Add placeholder for failed image
                  const result = drawWrappedText(
                    '[Image could not be loaded]',
                    timesItalicFont,
                    10,
                    pdfConfig.margin,
                    currentY,
                    currentPage
                  );
                  currentY = result.y;
                  currentPage = result.page;
                }
              } else {
                console.error('❌ Failed to load image data');
              }
            } catch (error) {
              console.error('❌ Error processing image:', error);
            }
            continue;
          }
        } else {
          // Handle text elements
          let text = element.textContent?.trim() || '';
          if (!text) continue;

          let font = timesRomanFont;

          // Process text element based on tag type
          switch (tagName) {
            case 'h1':
              currentY -= pdfConfig.fonts.h1.spacing;
              const h1Result = drawWrappedText(
                text, 
                timesBoldFont, 
                pdfConfig.fonts.h1.size, 
                pdfConfig.margin, 
                currentY,
                currentPage
              );
              currentY = h1Result.y;
              currentPage = h1Result.page;
              currentY -= pdfConfig.headerSpacing;
              break;

            case 'h2':
              currentY -= pdfConfig.fonts.h2.spacing;
              text = cleanHeadingText(text, i);
              const h2Result = drawWrappedText(
                text, 
                timesBoldFont, 
                pdfConfig.fonts.h2.size, 
                pdfConfig.margin, 
                currentY,
                currentPage
              );
              currentY = h2Result.y;
              currentPage = h2Result.page;
              currentY -= pdfConfig.headerSpacing;
              break;

            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
              currentY -= pdfConfig.fonts.h3.spacing;
              const h3Result = drawWrappedText(
                text, 
                timesBoldFont, 
                pdfConfig.fonts.h3.size, 
                pdfConfig.margin, 
                currentY,
                currentPage
              );
              currentY = h3Result.y;
              currentPage = h3Result.page;
              currentY -= pdfConfig.headerSpacing;
              break;

            case 'p':
              // Apply special formatting if needed
              if (element.querySelector('strong')) {
                font = timesBoldFont;
              } else if (element.querySelector('em')) {
                font = timesItalicFont;
              }
              
              currentY -= pdfConfig.fonts.p.spacing;
              const pResult = drawWrappedText(
                text, 
                font, 
                pdfConfig.fonts.p.size, 
                pdfConfig.margin, 
                currentY,
                currentPage
              );
              currentY = pResult.y;
              currentPage = pResult.page;
              currentY -= pdfConfig.paragraphSpacing;
              break;

            case 'ul':
            case 'ol':
              currentY -= pdfConfig.fonts.list.spacing;
              
              // Process each list item
              const listItems = element.querySelectorAll('li');
              for (let j = 0; j < listItems.length; j++) {
                const li = listItems[j];
                const bullet = tagName === 'ul' ? '•' : `${j + 1}.`;
                const listText = `${bullet} ${li.textContent?.trim()}`;
                
                // Check if list item might need a new page
                if (currentY < pdfConfig.margin + 30) {
                  const newPage = pdfDoc.addPage([pdfConfig.pageWidth, pdfConfig.pageHeight]);
                  currentPage = newPage;
                  currentY = newPage.getSize().height - pdfConfig.margin;
                }
                
                const liResult = drawWrappedText(
                  listText, 
                  timesRomanFont, 
                  pdfConfig.fonts.list.size, 
                  pdfConfig.margin, 
                  currentY,
                  currentPage,
                  pdfConfig.fonts.list.indent
                );
                currentY = liResult.y;
                currentPage = liResult.page;
                
                currentY -= pdfConfig.fonts.list.spacing;
              }
              
              currentY -= pdfConfig.paragraphSpacing;
              break;
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error processing chapter ${i + 1}:`, error);
    }
  }

  // --- ADD PAGE NUMBERS ---
  // Skip page numbers on title and cover pages
  const pageNumberStartIndex = hasCover ? 2 : 1; // Skip title page and cover page (if exists)
  
  for (let i = pageNumberStartIndex; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i);
    const pageNum = `${i - pageNumberStartIndex + 1}`;
    const pageNumWidth = timesRomanFont.widthOfTextAtSize(pageNum, 10);
    page.drawText(pageNum, {
      x: (pdfConfig.pageWidth - pageNumWidth) / 2,
      y: pdfConfig.margin / 2,
      size: 10,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // --- SAVE AND DOWNLOAD PDF ---
  console.log("Generating final PDF...");
  const pdfBytes = await pdfDoc.save();
  
  // Create PDF blob and download
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${courseTitle}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success("PDF downloaded successfully");
};



// Helper function to split long text into multiple lines
function splitTextIntoLines(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (lineWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}



export const addItem = (navigate:any) => {
  navigate("add");
};

export const editItem = (navigate:any,link:any,pre:any) =>{
  // navigate(link)
  console.log(link)
  if(pre){
    navigate(pre+'/'+'edit/'+link.ID)
  }else{
    navigate('edit/'+link.ID) 
  }
}


export const deleteItem = async (item: any,setCourses:any) => {
  
  const courseId = item["ID"];
  const courseType = "course"; // or "book", determine dynamically if needed

  try {
    const response = await apiService.post(
      `course-creator/deleteCourse/${courseId}/${courseType}`,
      {}
    );

    if (response.success) {
      setCourses((prevCourses:any) =>
        prevCourses.filter((course:any) => course["ID"] !== courseId)
      );
      console.log(`Course ${courseId} deleted successfully.`);
    } else {
      console.error("Failed to delete course:", response.message);
    }
  } catch (error) {
    console.error("Error deleting course:", error);
  }
};



export const ShareItem = async (navigate: any, item: any, openInNewWindow = true) => {
  const courseId = item["ID"];
  // Determine courseType from the row data structure
  const courseType = item["type"] || "course"; // Default to course if type isn't specified
  
  const sharedPath = `/shared/${courseType}/${courseId}`;
  
  if (openInNewWindow) {
    // Get the base URL of the application
    const baseUrl = window.location.origin;
    // Open in new tab/window
    window.open(`${baseUrl}${sharedPath}`, '_blank');
  } else {
    // Navigate in the same window (original behavior)
    navigate(sharedPath);
  }
  
  // Return the path (useful for copying links)
  return sharedPath;
};

// Helper function specifically for opening in a new window
export const openItemInNewWindow = async (item: any) => {
  return ShareItem(null, item, true);
};



/**
 * Format shared content for public viewing
 * This function prepares courses/books for public sharing
 */

const cleanImageUrl = (imgSrc: string): string => {
  return imgSrc
    .replace(/\\n\s*/g, '') // Remove escaped newlines and spaces
    .replace(/\\\\/g, '\\') // Fix double escaped backslashes
    .replace(/\\"/g, '"')   // Fix escaped quotes
    .replace(/^"|"$/g, '')  // Remove wrapping quotes
    .replace(/^data:image\/[^;]+;base64,/, (match) => decodeURIComponent(match)); // Handle base64
};

export const formatSharedContent = (content: any, title: string, type: 'course' | 'book'): string => {
   try {
    // Parse the content

    
    let chapters:any = [];
    content.map((chapter:any)=>{
      chapters.push(chapter)
    })
    try {
      // Clean and parse the content
      // const cleanedContent = content
      //   .replace(/^"|"$/g, '')
      //   .replace(/\\"/g, '"')
      //   .replace(/\\\\/g, '\\')
      //   .replace(/\\n/g, '\n')
      //   .replace(/\[\\"|\\"]/g, '"')
      //   .replace(/"{2,}/g, '"');
      
      // Parse content into chapters array
      // let parsedContent;
      // try {
      //   parsedContent = JSON.parse(cleanedContent);
      // } catch (e) {
      //   parsedContent = cleanedContent.split('","').map((ch: any) => 
      //     ch.replace(/^"|"$/g, '')
      //   );
      // }
      
      // chapters = Array.isArray(parsedContent) ? parsedContent : [parsedContent];
    } catch (error) {
      console.error("Content parsing error:", error);
      return `<div class="error-message">Error parsing content</div>`;
    }
    
    // Check for cover image
    // const coverIndex = chapters.findIndex((ch:any) => 
    //   JSON.stringify(ch).includes('book-cover-image') || JSON.stringify(ch).includes('data-cover="true"')
    // );
    
    // let coverHtml = '';
    // if (coverIndex >= 0) {
    //   // Extract cover image URL
    //   const parser = new DOMParser();
    //   const doc = parser.parseFromString(chapters[coverIndex], 'text/html');
    //   const coverImage = doc.querySelector('.book-cover-image');
    //   if (coverImage) {
    //     const imgSrc = coverImage.getAttribute('src');
    //     if (imgSrc) {
    //       coverHtml = `
    //         <div class="cover-container">
    //           <img src="${imgSrc}" alt="${title} Cover" class="cover-image">
    //         </div>
    //       `;
    //     }
    //   }
      
    //   // Remove cover from chapters array
    //   chapters.splice(coverIndex, 1);
    // }


    // Check for cover image with enhanced detection
// const coverIndex = chapters.findIndex((ch: any, index:any) => {
//   // Convert to string if it's an object
//   const chapterContent = typeof ch === 'object' && ch.content 
//     ? ch.content 
//     : (typeof ch === 'object' ? JSON.stringify(ch) : ch);
  
//   // Primary cover signals
//   const hasCoverClass = chapterContent.includes('book-cover-image') 
//   ;
//   const hasCoverAttribute = chapterContent.includes('data-cover="true"');
  
//   // Secondary cover signals (Quill classes with images)
//   const hasQuillImage = chapterContent.includes('p class="ql') && 
//                         chapterContent.includes('<img');
  
//   // Context signals that suggest this is a cover page
//   const isTitleChapter = chapterContent.includes('<h1>Cover</h1>') || 
//                          chapterContent.includes('<h1>Title</h1>') ||
//                          chapterContent.includes('<h1>Book Cover</h1>');
//   const isFirstChapter = index === 0;
  
//   // Primary signals are strongest
//   if (hasCoverClass || hasCoverAttribute) {
//     return true;
//   }
  
//   // Secondary signals combined with context are good indicators
//   if (hasQuillImage && (isTitleChapter || isFirstChapter)) {
//     return true;
//   }
  
//   return false;
// });

const coverIndex = chapters.findIndex((ch: any) =>
  // Case 1: String chapter with cover markers
  typeof ch === 'string' && (
    ch.includes('book-cover-image') || 
    ch.includes('data-cover="true"')
  ) || 
  // Case 2: Object chapter with content containing cover markers
  (typeof ch === 'object' && ch.content && (
    ch.content.includes('book-cover-image') ||
    ch.content.includes('data-cover="true"')
  )) ||
  // Case 3: Object chapter with "Cover Image" title
  (typeof ch === 'object' && 
   ch.title && 
   ch.title.toLowerCase().includes('cover') &&
   ch.content && 
   ch.content.includes('<img')) ||
  // Case 4: Check first chapter with image for possible cover image
  (typeof ch === 'object' && 
   ch.content && 
   ch.content.includes('<img') && 
   chapters.indexOf(ch) === 0)
);

let coverHtml = '';
if (coverIndex >= 0) {
  // Extract cover image URL
  const parser = new DOMParser();
  let docContent = chapters[coverIndex];
  // If it's an object with a content property, use that
  if (typeof docContent === 'object' && docContent.content) {
    docContent = docContent.content;
  }
  const doc = parser.parseFromString(docContent, 'text/html');
  
  // Try multiple selectors to find the cover image
  let coverImage = doc.querySelector('.book-cover-image');
  
  // If not found, look for images inside Quill p tags
  if (!coverImage) {

    console.log("inside if when normal cover not found")
    // Try various Quill selectors
    const selectors = [
      'p.ql-align-center img', // Centered images
      'p[class^="ql-"] img',   // Any Quill paragraph with image
      '.ql-editor p img',      // Images in paragraphs inside editor
      'img[class*="ql-"]',     // Images with Quill classes
      'img'                    // Any image as last resort
    ];
    
    for (const selector of selectors) {
      coverImage = doc.querySelector(selector);
      if (coverImage) break;
    }
  }
  
  if (coverImage) {
    const imgSrc = coverImage.getAttribute('src');
    if (imgSrc) {
      coverHtml = `
        <div class="cover-container">
          <img src="${imgSrc}" alt="${title} Cover" class="cover-image">
        </div>
      `;
    }
  }
  
  // Remove cover from chapters array
  chapters.splice(coverIndex, 1);
}
    
    // Generate table of contents
    let tocHtml = `<div class="toc-container">
      <h2>Table of Contents</h2>
      <ul class="toc-list">`;
    
    // Process each chapter to extract titles for TOC
    const chapterTitles = chapters.map((chapter:any, index:any) => {
      const parser = new DOMParser();
      if(typeof(chapter)==='string'){
        const doc = parser.parseFromString(chapter, 'text/html');
        const h1 = doc.querySelector('h1');
        return h1?.textContent || `Chapter ${index + 1}`;
      }else{
        const doc = parser.parseFromString(chapter.content, 'text/html');
        const h1 = doc.querySelector('h1');
        return h1?.textContent || `Chapter ${index + 1}`;
      }
    });
    // Generate TOC entries
    chapterTitles.forEach((title:any, index:any) => {
      tocHtml += `<li><a href="#chapter-${index + 1}" class="toc-link">${title}</a></li>`;
    });
    tocHtml += `</ul></div>`;
    
    // Process each chapter
    let chaptersHtml = '';
    chapters.forEach((chapter:any, index:any) => {
      // Process chapter content
        const processedChapter = processChapterForSharing(chapter, index);
        chaptersHtml += processedChapter;
        chaptersHtml = chaptersHtml.replace(/\["|"\]/g, '');
      
    });

    
    // Assemble the complete HTML
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} | Shared ${type === 'book' ? 'Book' : 'Course'}</title>
<style>
  :root {
    --primary-color: #650AAA;
    --secondary-color: #1537E9;
    --text-color: #222222;
    --background-color: #fafafa;
    --border-color: #EBEBEB;
    --highlight-color: #fff;
    --shadow-color: rgba(0, 0, 0, 0.05);
  }
  
  * {
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Montesserat', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--background-color);
    margin: 0;
    padding: 0;
    font-size: 16px;
  }
  
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  header {
    text-align: center;
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 2px solid var(--primary-color);
  }
  
  .title {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 0.75rem;
    font-weight: 700;
    font-family: 'Merriweather', serif;
    line-height: 1.2;
  }
  
  .subtitle {
    font-size: 1.2rem;
    color: #888888;
    font-weight: normal;
  }
  
  .cover-toc-container {
  display: flex;
  flex-direction: row;
  gap: 30px;
  align-items: stretch;
  margin: 2rem 0;
  min-height: 300px;
}

.cover-container {
  flex: 0 0 40%;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  max-width: 100%;
  height: 500px;
  width: auto;
  // object-fit: contain;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-radius: 8px;
}

.toc-container {
  flex: 1;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
  background-color: var(--highlight-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px var(--shadow-color);
}
  .toc-container h2 {
    margin-top: 0;
    color: var(--primary-color);
    font-size: 1.5rem;
    font-family: 'Merriweather', serif;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.75rem;
    margin-bottom: 1.25rem;
  }
  
  .toc-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .toc-link {
    display: block;
    padding: 0.6rem 0.5rem;
    color: var(--text-color);
    text-decoration: none;
    font-weight: 500;
    border-radius: 4px;
    transition: all 0.2s ease;
    margin-bottom: 0.25rem;
  }
  
  .toc-link:hover {
    color: var(--primary-color);
    background-color: rgba(101, 10, 170, 0.05);
    padding-left: 0.75rem;
  }
  
  .chapter {
    margin: 3rem 0;
    padding: 2rem;
    background-color: var(--highlight-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px var(--shadow-color);
    border: 1px solid var(--border-color);
  }
  
  .chapter-title {
    color: var(--primary-color);
    font-family: 'Merriweather', serif;
    font-size: 2rem;
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
    line-height: 1.3;
  }
  
  .chapter-content {
    margin-bottom: 1.5rem;
    font-size: 1rem;
    line-height: 1.7;
  }
  
  .chapter-content h2 {
    color: #333;
    font-family: 'Merriweather', serif;
    font-size: 1.5rem;
    margin: 2rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .chapter-content h3 {
    color: #444;
    font-family: 'Merriweather', serif;
    font-size: 1.3rem;
    margin: 1.75rem 0 0.75rem;
  }
  
  .chapter-content p {
    margin-bottom: 1.25rem;
    line-height: 1.75;
    color: #333;
  }
  
  .chapter-content ul,
  .chapter-content ol {
    margin-bottom: 1.25rem;
    padding-left: 1.5rem;
  }
  
  .chapter-content li {
    margin-bottom: 0.5rem;
    color: #333;
  }
  
  .chapter-content img {
    max-width: 100%;
    margin: 1.25rem auto;
    border-radius: 4px;
    display: block;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  .quiz-container {
    background-color: #fcfcfc;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.75rem;
    margin: 2.5rem 0;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  }
  
  .quiz-container h2,
  .quiz-container h3 {
    color: var(--primary-color);
    font-family: 'Merriweather', serif;
    font-size: 1.5rem;
    margin-top: 0;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
  }
  
  .quiz-question {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color);
  }
  
  .quiz-question:last-child {
    border-bottom: none;
  }
  
  .quiz-question p {
    font-weight: 600;
    margin-bottom: 1rem;
    font-size: 1.05rem;
    color: #333;
  }
  
  .quiz-question ul {
    list-style-type: none;
    padding: 0;
  }
  
  .quiz-question li {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    padding: 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }
  
  .quiz-question li:hover {
    background-color: rgba(101, 10, 170, 0.05);
  }
  
  .circle-marker {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #ccc;
    border-radius: 50%;
    margin-right: 10px;
    cursor: pointer;
    vertical-align: middle;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  
  .circle-marker.selected {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
  }
  
  .quiz-answer-field {
    padding: 10px 14px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-size: 1rem;
    width: 100%;
    max-width: 400px;
    transition: border-color 0.2s ease;
    margin-top: 0.5rem;
  }
  
  .quiz-answer-field:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 2px rgba(101, 10, 170, 0.1);
  }
  
  .quiz-submit-btn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 50px;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.3s ease;
    margin-top: 1.25rem;
  }
  
  .quiz-submit-btn:hover {
    background-color: #540a8c;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .quiz-submit-btn:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  .quiz-feedback {
    margin-top: 12px;
    padding: 12px;
    border-radius: 6px;
    font-weight: 500;
    display: none;
  }
  
  .correct-feedback {
    background-color: #f0fdf4;
    color: #166534;
    border-left: 3px solid #22c55e;
  }
  
  .incorrect-feedback {
    background-color: #fef2f2;
    color: #991b1b;
    border-left: 3px solid #ef4444;
  }
  
  .quiz-results {
    margin-top: 20px;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background-color: #f9f9f9;
    display: none;
  }
  
  .quiz-results h4 {
    margin-top: 0;
    color: #333;
    font-size: 1.25rem;
    margin-bottom: 12px;
  }
  
  .quiz-score {
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .score-value {
    color: var(--primary-color);
  }
  
  footer {
    text-align: center;
    margin-top: 4rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--border-color);
    font-size: 0.9rem;
    color: #888888;
  }
  
  .flash-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.flash-card {
  perspective: 1000px;
  height: 200px;
}

.flash-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  cursor: pointer;
}

.flash-card-inner:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.flash-card-front,
.flash-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.flash-card-front {
  background: linear-gradient(145deg, #ffffff, #f0f0f0);
  border: 1px solid #e5e7eb;
}

.flash-card-back {
  background: linear-gradient(145deg, #f0f7ff, #e1effe);
  border: 1px solid #e5e7eb;
  transform: rotateY(180deg);
}

.flash-card-inner.flipped {
  transform: rotateY(180deg);
}
  .short-answer-field {
    width: 100%;
    min-height: 100px;
    padding: 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
  }
  
  .short-answer-field:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(101, 10, 170, 0.1);
  }
  
  .short-answer-question .correct-feedback {
    margin-top: 1rem;
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .container {
      padding: 1.25rem;
    }
    
    .title {
      font-size: 1.75rem;
    }
    
    .chapter {
      padding: 1.5rem;
    }
    
    .chapter-title {
      font-size: 1.6rem;
    }
    
    .quiz-container {
      padding: 1.25rem;
    }
    
    .cover-toc-container {
      flex-direction: column;
    }
    
    .cover-container {
      width: 100%;
    }
    
    .toc-container {
      width: 100%;
      max-height: none;
      margin-top: 1.5rem;
    }
    
    .flash-cards-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1 class="title">${title}</h1>
          </header>
          
         <div class="cover-toc-container">
  ${coverHtml}
  ${tocHtml}
</div>
          
          <div class="chapters-container">
            ${chaptersHtml}
          </div>
          
        
        </div>
        

      </body>
      </html>
    `;
    
    return htmlTemplate;
  } catch (error:any) {
    console.error('Error formatting shared content:', error);
    return `<div class="error-message">Error formatting content: ${error.message}</div>`;
  }
};

function processChapterForSharing(chapter: any, index: number): string {
  try {
    if(typeof(chapter)==="string"){
    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(chapter, 'text/html');
    
    // Extract title
    const titleElement = doc.querySelector('h1');
    const title = titleElement?.textContent || `Chapter ${index + 1}`;
    
    // Remove h1 from content to avoid duplication
    if (titleElement) {
      titleElement.remove();
    }
    
    // Try to find quiz content with improved pattern matching
    let quizHtml = '';
    
    // Method 1: Look for quiz content with various escape patterns
    const tryExtractQuiz = (text:any) => {
      const patterns = [
        { start: '<!-- SHARED_QUIZ_START -->', end: '<!-- SHARED_QUIZ_END -->' },
        { start: '\\n    <!-- SHARED_QUIZ_START -->', end: '<!-- SHARED_QUIZ_END -->' },
        { start: '\\n    <!-- SHARED_QUIZ_START -->', end: '\\n    <!-- SHARED_QUIZ_END -->' },
        { start: '\\\\n    <!-- SHARED_QUIZ_START -->', end: '<!-- SHARED_QUIZ_END -->' },
        { start: '\\\\n    <!-- SHARED_QUIZ_START -->', end: '\\\\n    <!-- SHARED_QUIZ_END -->' },
        { start: '###SHARED_QUIZ_START###', end: '###SHARED_QUIZ_END###' }
      ];

      for (const pattern of patterns) {
        const startIdx = text.indexOf(pattern.start);
        if (startIdx !== -1) {
          const startContentIdx = startIdx + pattern.start.length;
          const endIdx = text.indexOf(pattern.end, startContentIdx);
          if (endIdx !== -1) {
            return text.substring(startContentIdx, endIdx);
          }
        }
      }
      
      // Try with regex as fallback
      const regex = /(<!--|###)SHARED_QUIZ_START(-->|###)([\s\S]*?)(<!--|###)SHARED_QUIZ_END(-->|###)/i;
      const match = text.match(regex);
      return match ? match[3] : '';
    };
    
    // First try with original text
    quizHtml = tryExtractQuiz(chapter);

    console.log("Quiz HTML found, length:", quizHtml ? quizHtml.length : 0);
    
    // If not found, try with progressively unescaped versions
    if (!quizHtml) {
      const unescaped1 = chapter.replace(/\\\\n/g, '\n').replace(/\\\\/g, '\\');
      quizHtml = tryExtractQuiz(unescaped1);
      
      if (!quizHtml) {
        const unescaped2 = unescaped1.replace(/\\"/g, '"').replace(/\\n/g, '\n');
        quizHtml = tryExtractQuiz(unescaped2);
      }
    }
    
    // Clean up the main content by removing quiz sections
    let content = doc.body.innerHTML;
    
    // Remove the static quiz display meant for the editor
    const tempDoc = parser.parseFromString(content, 'text/html');
    const exercisesHeaders = Array.from(tempDoc.querySelectorAll('h2'));
    
    exercisesHeaders.forEach(header => {
      if (header.textContent?.trim() === 'Exercises') {
        let currentNode = header as any;
        const nodesToRemove = [];
        
        while (currentNode) {
          nodesToRemove.push(currentNode);
          
          if (currentNode.nextElementSibling === null || 
              currentNode.nextElementSibling.tagName === 'H2') {
            break;
          }
          
          currentNode = currentNode.nextElementSibling;
        }
        
        nodesToRemove.forEach(node => {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
      }
    });
    
    content = tempDoc.body.innerHTML;
    
    // Only add the quiz content if we actually found some
    if (quizHtml) {
      // Deep cleaning of the quiz HTML to fix all escaping issues
      quizHtml = quizHtml
        .replace(/\\\\n/g, '\n')     // Double-escaped newlines
        .replace(/\\n/g, '\n')       // Single-escaped newlines
        .replace(/\\\\/g, '\\')      // Double-escaped backslashes
        .replace(/\\"/g, '"')        // Escaped quotes
        .replace(/\\t/g, '\t')       // Escaped tabs
        .replace(/\\"([^"]*)\\"/g, '"$1"') // Quoted strings with escaped quotes
        .replace(/style=\\"/g, 'style="')  // Specific case for style attributes
        .replace(/\\"><\/div>/g, '"></div>') // Specific case for div closings
        .replace(/\\'/g, "'")        // Escaped single quotes
        .replace(/\\&/g, "&")        // Escaped ampersands
        .replace(/\\>/g, ">")        // Escaped closing brackets
        .replace(/\\</g, "<")        // Escaped opening brackets
        .replace(/\\}/g, "}")        // Escaped braces
        .replace(/\\{/g, "{")        // Escaped braces
        .replace(/\\/g, "");        // Any remaining single backslashes

      // Check if the quizHtml already contains an Exercises heading to avoid duplication
      const hasExercisesHeader = quizHtml.includes('<h2>Exercises</h2>') || 
                               quizHtml.includes('<h2>exercises</h2>') || 
                               quizHtml.includes('<h2 class="') && quizHtml.includes('>Exercises</h2>') ||
                               quizHtml.includes('<h3>Exercises</h3>');
      
      // Add the quiz content with proper Exercises heading if not already present
      if (!hasExercisesHeader) {
        content += `<h2>Exercises</h2>${quizHtml}`;
      } else {
        content += quizHtml;
      }
    }
    content = wrapFlashCardsInGrid(content);

    return `
      <section id="chapter-${index + 1}" class="chapter">
        <h2 class="chapter-title">${title}</h2>
        <div class="chapter-content">
          ${content}
        </div>
      </section>
    `;
    }else{
          // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(chapter.content, 'text/html');
    // Extract title
    const titleElement = doc.querySelector('h1');
    const title = titleElement?.textContent || `Chapter ${index + 1}`;
    
    // Remove h1 from content to avoid duplication
    if (titleElement) {
      titleElement.remove();
    }
    
    // Try to find quiz content with improved pattern matching
    let quizHtml = '';
    // Method 1: Look for quiz content with various escape patterns
    
    if(typeof(chapter.quiz)==='string'){
      quizHtml = chapter.quiz
    }else{
      quizHtml = chapter.quiz?.sharedContent;
    }
    
    // First try with original text

    // console.log("Quiz HTML found, length:", quizHtml );
    
    // If not found, try with progressively unescaped versions
    // if (!quizHtml) {
    //   const unescaped1 = chapter.replace(/\\\\n/g, '\n').replace(/\\\\/g, '\\');
    //   quizHtml = tryExtractQuiz(unescaped1);
      
    //   if (!quizHtml) {
    //     const unescaped2 = unescaped1.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    //     quizHtml = tryExtractQuiz(unescaped2);
    //   }
    // }
    
    // Clean up the main content by removing quiz sections
    let content = doc.body.innerHTML;
    
    // Remove the static quiz display meant for the editor
    const tempDoc = parser.parseFromString(content, 'text/html');
    const exercisesHeaders = Array.from(tempDoc.querySelectorAll('h2'));
    
    exercisesHeaders.forEach(header => {
      if (header.textContent?.trim() === 'Exercises') {
        let currentNode = header as any;
        const nodesToRemove = [];
        
        while (currentNode) {
          nodesToRemove.push(currentNode);
          
          if (currentNode.nextElementSibling === null || 
              currentNode.nextElementSibling.tagName === 'H2') {
            break;
          }
          
          currentNode = currentNode.nextElementSibling;
        }
        
        nodesToRemove.forEach(node => {
          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
      }
    });
    
    content = tempDoc.body.innerHTML;
    
    // Only add the quiz content if we actually found some
    if (quizHtml) {
      // Deep cleaning of the quiz HTML to fix all escaping issues
      quizHtml = quizHtml
        .replace(/\\\\n/g, '\n')     // Double-escaped newlines
        .replace(/\\n/g, '\n')       // Single-escaped newlines
        .replace(/\\\\/g, '\\')      // Double-escaped backslashes
        .replace(/\\"/g, '"')        // Escaped quotes
        .replace(/\\t/g, '\t')       // Escaped tabs
        .replace(/\\"([^"]*)\\"/g, '"$1"') // Quoted strings with escaped quotes
        .replace(/style=\\"/g, 'style="')  // Specific case for style attributes
        .replace(/\\"><\/div>/g, '"></div>') // Specific case for div closings
        .replace(/\\'/g, "'")        // Escaped single quotes
        .replace(/\\&/g, "&")        // Escaped ampersands
        .replace(/\\>/g, ">")        // Escaped closing brackets
        .replace(/\\</g, "<")        // Escaped opening brackets
        .replace(/\\}/g, "}")        // Escaped braces
        .replace(/\\{/g, "{")        // Escaped braces
        .replace(/\\/g, "");        // Any remaining single backslashes

      // Check if the quizHtml already contains an Exercises heading to avoid duplication
      const hasExercisesHeader = quizHtml.includes('<h2>Exercises</h2>') || 
                               quizHtml.includes('<h2>exercises</h2>') || 
                               quizHtml.includes('<h2 class="') && quizHtml.includes('>Exercises</h2>') ||
                               quizHtml.includes('<h3>Exercises</h3>');
      
      // Add the quiz content with proper Exercises heading if not already present

      if(typeof(chapter.quiz)==='string'){
        quizHtml = legacyQuizConversion(quizHtml)
        console.log(quizHtml, '<<<<<<<<<<<<< ')
      }
      if (!hasExercisesHeader) {
        content += `<h2>Exercises</h2>${quizHtml}`;
      } else {
        content += quizHtml;
      }
    }
    content = wrapFlashCardsInGrid(content);

    return `
      <section id="chapter-${index + 1}" class="chapter">
        <h2 class="chapter-title">${title}</h2>
        <div class="chapter-content">
          ${content}
        </div>
      </section>
    `;
    }
    

  } catch (error) {
    console.error(`Error processing chapter ${index + 1}:`, error);
    return `<section class="chapter error">
      <h2 class="chapter-title">Chapter ${index + 1}</h2>
      <div class="chapter-content">
        <p>Error processing this chapter.</p>
      </div>
    </section>`;
  }
}

function legacyQuizConversion(input: string) {
  const blocks = input.trim().split(/\n(?=Question \d+:)/);

  const htmlCards = blocks.map((block: string, index: number) => {
    const questionMatch = block.match(/Q:\s*(.+)/);
    const answerMatch = block.match(/A:\s*(.+)/);
    const question = questionMatch ? questionMatch[1].trim() : '';
    const answer = answerMatch ? answerMatch[1].trim() : '';

    return `
<div class="rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200">
  <div class="flex items-start gap-3 p-4 border-b border-gray-100">
    <div class="flex-shrink-0 w-6 h-6 bg-purple-50 text-purple-700 font-medium text-sm rounded flex items-center justify-center mt-7">${index + 1}</div>
    <div class="flex-1">
      <h3 class="text-base font-semibold text-gray-800">${question}</h3>
    </div>
  </div>
  <div class="px-4 py-3 text-sm text-gray-700">
    ${answer}
  </div>
</div>`;
  }).join('\n');

  return `
<div class="space-y-4">
  ${htmlCards}
</div>`;
}


// Helper function to escape special characters for RegExp
function escapeRegExp(string:any) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


/**
 * Sanitize HTML content for security
 */
function sanitizeHtml(html: string): string {
  try {
    // Create a new DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Process and sanitize all elements
    sanitizeNode(doc.body);
    
    // Make quiz elements interactive
    enhanceQuizElements(doc.body);
    
    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    return html; // Return original if sanitization fails
  }
}

/**
 * Recursively sanitize a DOM node
 */
function sanitizeNode(node: Node): void {
  // Skip if not an element
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  
  const element = node as Element;
  
  // Handle specific elements
  if (element.tagName === 'SCRIPT') {
    element.remove();
    return;
  }
  
  // Remove event handlers
  const attributes = element.attributes;
  for (let i = attributes.length - 1; i >= 0; i--) {
    const attrName = attributes[i].name;
    if (attrName.startsWith('on') || attrName === 'href' && attributes[i].value.startsWith('javascript:')) {
      element.removeAttribute(attrName);
    }
  }
  
  // Process children
  for (let i = 0; i < element.childNodes.length; i++) {
    sanitizeNode(element.childNodes[i]);
  }
}

/**
 * Enhance quiz elements for interactivity
 */
/**
 * Enhance quiz elements for interactivity
 */
function enhanceQuizElements(rootElement: Element): void {
  console.log("Enhancing quiz elements for interactivity");
  
  // 1. Set up flash cards
  rootElement.querySelectorAll('.flash-card-inner').forEach(card => {
    card.addEventListener('click', () => {
      const currentTransform = card.getAttribute('style') || '';
      if (currentTransform.includes('rotateY(180deg)')) {
        card.setAttribute('style', 
          currentTransform.replace('rotateY(180deg)', '')
        );
      } else {
        card.setAttribute('style', 
          `${currentTransform}transform: rotateY(180deg);`
        );
      }
    });
  });
  
  // 2. Set up short answer questions
  rootElement.querySelectorAll('.short-answer-question').forEach((question, index) => {
    const textarea = question.querySelector('.short-answer-field');
    const feedback = question.querySelector('.correct-feedback');
    const submitBtn = question.querySelector('.quiz-submit-btn');
    
    if (submitBtn && !submitBtn.hasAttribute('data-enhanced')) {
      submitBtn.setAttribute('data-enhanced', 'true');
      submitBtn.addEventListener('click', () => {
        if (feedback) {
          feedback.setAttribute('style', 'display: block');
        }
      });
    }
  });
  
  // 3. Ensure quiz containers have proper IDs
  rootElement.querySelectorAll('.quiz-container').forEach((container, index) => {
    if (!container.id) {
      container.id = `quiz-${Date.now()}-${index}`;
    }
    
    // Ensure submit buttons have the quiz ID
    const submitBtn = container.querySelector('.quiz-submit-btn');
    if (submitBtn) {
      submitBtn.setAttribute('data-quiz-id', container.id);
    }
  });
}



// Add this function to your code - it will wrap flash cards in a grid container
function wrapFlashCardsInGrid(html:any) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Find sequences of flash cards
  const flashCards = Array.from(doc.querySelectorAll('.flash-card'));
  
  if (flashCards.length > 0) {
    // Create grid containers for each sequence of flash cards
    let currentCard = flashCards[0];
    let cardSequence = [];
    
    // Create grid containers
    while (currentCard) {
      // Start a new sequence
      cardSequence = [];
      let card = currentCard as any;
      
      // Collect adjacent flash cards
      while (card && card.classList.contains('flash-card')) {
        cardSequence.push(card);
        
        // Find next sibling that may be a flash card
        let nextCard = card.nextElementSibling;
        while (nextCard && nextCard.nodeType !== Node.ELEMENT_NODE) {
          nextCard = nextCard.nextElementSibling;
        }
        
        card = nextCard;
      }
      
      // If we found flash cards, wrap them in a grid
      if (cardSequence.length > 0) {
        // Create grid container
        const gridContainer = doc.createElement('div');
        gridContainer.className = 'flash-cards-grid';
        
        // Insert grid before the first card
        const firstCard = cardSequence[0];
        firstCard.parentNode.insertBefore(gridContainer, firstCard);
        
        // Move all cards into the grid
        cardSequence.forEach(card => {
          gridContainer.appendChild(card);
        });
        
        // Update current card to the next element after our grid
        currentCard = card;
      } else {
        break;
      }
    }
  }
  
  return doc.body.innerHTML;
}


function cleanHeadingText(text: string, chapterNumber?: number): string {
  // Remove duplicate number patterns like "2.2", "3.3", etc.
  let cleaned = text.replace(/^(\d+)\.(\1)/, '$1.$2');
  
  // If there's a number followed by the same number (e.g. "2 2"), fix it
  cleaned = cleaned.replace(/^(\d+)\s+\1/, '$1');

  // If we have chapter number, remove redundant chapter numbers from section titles
  if (chapterNumber !== undefined) {
    cleaned = cleaned.replace(new RegExp(`^${chapterNumber}\\.\\s*`), '');
  }
  
  return cleaned;
}

// Convenience functions for specific formats
export const downloadPdf = async (row: any, setLoading: any) => {
  return downloadItem(row, setLoading, 'pdf');
};

export const downloadDocxFromItem = async (row: any, setLoading: any) => {
  return downloadItem(row, setLoading, 'docx');
};