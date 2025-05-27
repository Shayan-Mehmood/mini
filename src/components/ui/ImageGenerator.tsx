import { useState, useEffect } from "react";
import {
  Loader2,
  ImageIcon,
  Plus,
  XCircle,
  RefreshCw,
  LightbulbIcon,
  Book
  
} from "lucide-react";
import { generateImage } from "../../utilities/service/imageService";
import { Button } from "./button";
import Tooltip from "./tooltip";
import apiService from "../../utilities/service/api";

interface ImageGeneratorProps {
  onImageSelect: (imageUrl: string) => void;
  isEditorContext?: boolean;
  onGenerateStart?: () => void;
  uploadedImage?: string;
  courseId?: string | number;
  contentType?: string;
  NotCover?: boolean;
  isCoverMode?: boolean; // New prop to indicate when we're generating a course cover
  onAddAsCover?: (imageUrl: string) => void; // Function to call when adding as cover
}

interface ApiResponse {
  success: boolean;
  data: any;
  message: string;
}

// Update GalleryImage interface for new API response
interface GalleryImage {
  key: string;
  url: string;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  onImageSelect,
  isEditorContext = false,
  onGenerateStart,
  uploadedImage,
  courseId,
  contentType,
  NotCover = false,
  isCoverMode = false, // Default to false
  onAddAsCover,
}) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);
  const [promptInputRef, setPromptInputRef] =
    useState<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (uploadedImage) {
      setPrompt("");
      setGeneratedImage(uploadedImage);
    }
  }, [uploadedImage]);

  // Fetch previously generated images when the gallery tab is opened
  useEffect(() => {
    if (!NotCover && showGallery && contentType && courseId) {
      fetchPreviousImages();
    }
  }, [showGallery, contentType, courseId, NotCover]);

  const fetchPreviousImages = async () => {
    if (!contentType || !courseId) {
      setError("Content type or ID not provided");
      return;
    }

    try {
      setLoadingGallery(true);
      const response = await apiService.get(
        `/images/${contentType}/${courseId}`
      );

      if (response?.success && Array.isArray(response?.data)) {
        setGalleryImages(response.data); // response.data is now an array of { key, url }
      } else {
        setGalleryImages([]);
      }
    } catch (err) {
      console.error("Failed to fetch images:", err);
      setError("Failed to load previous images");
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleGenerate = async () => {
  if (!prompt.trim()) return;
  setLoading(true);
  setError(null);

  // Notify parent component that generation has started
  if (onGenerateStart) {
    onGenerateStart();
  }

  // Prepare payload for the image generation API
  const payload = {
    prompt: prompt.trim(),
    contentId: courseId || null,
    contentType: contentType || "general",
  };

  try {
    // Pass the structured payload to generateImage
    const response: ApiResponse = await generateImage(
      payload.prompt,
      Number(payload.contentId),
      payload.contentType
    );

    if (response.success) {
      setGeneratedImage(response.data.url);
      // Only auto-select the image when NOT in cover mode AND not in editor context
      if (!isEditorContext && !isCoverMode) {
        onImageSelect(response.data.url);
      }
      if (!NotCover && showGallery && contentType && courseId) {
        fetchPreviousImages();
      }
    }
  } catch (err) {
    console.error(err);
    setError("Failed to generate image");
  } finally {
    setLoading(false);
  }
};

  const handleInsertImage = () => {
    if (generatedImage) {
      onImageSelect(generatedImage);
    } else if (selectedGalleryImage) {
      onImageSelect(selectedGalleryImage);
    }
  };

  const selectGalleryImage = (image: GalleryImage) => {
    setSelectedGalleryImage(image.url);
    setGeneratedImage(image.url);
    // Reference to ImageEditor
    if (!isEditorContext) {
      onImageSelect(image.url);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if Enter key was pressed without Shift (to allow multiline text with Shift+Enter)
      if (event.key === "Enter" && !event.shiftKey) {
        // Check if the prompt field is focused and has content
        if (
          document.activeElement === promptInputRef &&
          prompt.trim() &&
          !loading
        ) {
          event.preventDefault(); // Prevent newline in textarea
          handleGenerate();
        }
      }
    };

    // Add event listener
    if (promptInputRef) {
      promptInputRef.addEventListener("keydown", handleKeyPress);
    }

    // Clean up
    return () => {
      if (promptInputRef) {
        promptInputRef.removeEventListener("keydown", handleKeyPress);
      }
    };
  }, [promptInputRef, prompt, loading, handleGenerate]);

  // Add this function to handle both adding cover and closing the modal
  const handleAddCoverAndClose = (imageUrl: string) => {
    if (onAddAsCover) {
      onAddAsCover(imageUrl);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden">
      {/* Only show gallery tabs if NotCover is false */}

      {/* Show generator if NotCover is true or if gallery is not selected */}
      {NotCover || !showGallery ? (
        // Generate Image Section
        <div className="flex flex-col md:flex-row">
          {/* Left Section - Input */}
          <div className="flex-1 md:p-6 p-1 border-r border-purple-100">
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                ref={(el) => setPromptInputRef(el)}
                placeholder="Describe the image you want to create... (e.g., 'A magical castle under a starry night sky')"
                className="w-full p-4 text-sm border border-purple-200 rounded-lg
           focus:outline-none focus:ring-2 focus:ring-purple-500/30 
           focus:border-purple-500 min-h-[120px] resize-none
           bg-purple-50/30"
              />

              <p className="text-xs text-gray-500 mt-1">
                Press Enter to generate, or Shift+Enter for a new line
              </p>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  variant="outline"
                  className="justify-center text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 whitespace-nowrap disabled:pointer-events-none h-10 px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" /> Generate Image
                    </>
                  )}
                </Button>

                {generatedImage && (
                  <button
                    onClick={() => setGeneratedImage(null)}
                    className="px-4 rounded-lg border border-purple-200 
                             hover:bg-purple-50 transition-colors"
                    title="Generate New Image"
                  >
                    <Tooltip width="auto" content="Start over with a new image">
                      <RefreshCw className="w-5 h-5 text-gray-700" />
                    </Tooltip>
                  </button>
                )}
              </div>

              {/* Add Set as Cover button when in cover mode and image is generated */}
             

              {error && (
                <div
                  className="flex items-center gap-2 p-4 bg-red-50 
                              border border-red-200 rounded-lg animate-fadeIn"
                >
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Tips Section - Integrated */}
              <div className="mt-6 pt-6 border-t border-purple-100">
                <div className="flex items-center gap-2 text-gray-700 mb-3">
                  <LightbulbIcon className="w-4 h-4 text-gray-700" />
                  <h4 className="text-sm md:text-lg">Tips for better results:</h4>
                </div>
                <ul className="text-sm text-gray-700 space-y-1.5 pl-5">
                  <li>
                    • Be specific about the style (e.g., watercolor, digital
                    art)
                  </li>
                  <li>• Include details about lighting and mood</li>
                  <li>• Specify the perspective or composition</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Section - Preview */}
          <div className="flex-1 p-6 bg-purple-50/30">
            <div className="h-full flex flex-col">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex justify-between">
                <span>{isCoverMode ? " Cover Preview" : "Preview"}</span>

                {/* Always show insert button when in editor context and an image is available */}
                {isEditorContext && generatedImage && !isCoverMode && (
                  <button
                    onClick={handleInsertImage}
                    className="hidden px-3 py-1 bg-purple-600 text-white text-xs rounded-lg items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Insert
                  </button>
                )}
                 {isCoverMode && generatedImage && onAddAsCover && (
                <button
                  onClick={() => handleAddCoverAndClose(generatedImage)}
                  className="flex items-center gap-1.5 px-6 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Cover
                </button>
              )}
              </h3>

              {generatedImage ? (
                <div
                  className={`relative rounded-xl overflow-hidden flex-1 ${
                    isEditorContext ? "" : "group"
                  }`}
                >
                  <img
                    src={generatedImage}
                    alt="AI Generated"
                    className="w-full h-full object-cover rounded-lg transition-transform duration-300"
                    // onError={(e) => {
                    //   setError("Failed to load generated image");
                    // }}
                       onError={(e) => {
    console.error("Image failed to load:", generatedImage);
    setError("Failed to load generated image. Using proxy...");
    
    // Try with a proxy approach or direct URL
    const imgElement = e.target as HTMLImageElement;
    // Add referrerPolicy and crossOrigin attributes
    imgElement.referrerPolicy = "no-referrer";
    imgElement.crossOrigin = "anonymous";
    
    // Try the direct URL approach
    if (!imgElement.src.includes('?direct=true')) {
      imgElement.src = `${generatedImage}?direct=true`;
    }
  }}
  referrerPolicy="no-referrer"
  crossOrigin="anonymous"
                  />

                  {/* Add floating action button for cover in the preview */}
                  {isCoverMode && generatedImage && onAddAsCover && (
                    <div className="absolute bottom-4 right-4 md:hidden">
                      <Button
                        onClick={() => handleAddCoverAndClose(generatedImage)}
                        variant="outline"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                      >
                        <Book className="w-4 h-4 mr-2" />
                        Use as Cover
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex-1 rounded-xl border-2 border-dashed 
                              border-purple-200 flex items-center justify-center"
                >
                  <p className="text-gray-700 text-sm">
                    {isCoverMode ? " cover will appear here" : "Generated image will appear here"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImageGenerator;
