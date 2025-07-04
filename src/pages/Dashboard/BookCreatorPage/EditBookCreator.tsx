import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import ChapterGallery from "../CourseCreatorPage/ChapterGallery";
import {
  Book,
  ImageIcon,
  PackagePlus,
  ShieldCloseIcon,
  Save,
  ExternalLink,
  Music,
  FileCode2Icon,
  Mail,
  ImagesIcon,
  ShieldCheck,
} from "lucide-react";
import ImageGenerator from "../../../components/ui/ImageGenerator";
import { Button } from "../../../components/ui/button";
import Modal from "../../../components/ui/Modal";
import ImageEditor from "../../../components/ui/ImageEditor/ImageEditor";
import ReactQuill from "react-quill";
import { GenerateCover } from "../../../components/AiToolForms/BookCreator/GenerateCover";
import toast from "react-hot-toast";
import AlertDialog from "../../../components/AlertDialog";
import { GenerateQuiz } from "../../../components/GenerateQuiz";
import { QuizDisplay } from "../../../components/QuizDisplay";
import BackButton from "../../../components/ui/BackButton";
import {
  processChapterSelection,
  handleContentUpdate,
  updateEditorImage,
  generateCoverContent,
  isCoverChapter,
  formatQuizContent,
} from "../../../utilities/shared/editorUtils";
import {
  determineQuizType,
  formatQuizHTML,
} from "../../../utilities/shared/quizUtils";
import ImageGallery from "../../../components/AiToolForms/BookCreator/ImageGallery";
import AdminModel from "../../../components/AdminModel";
import ChapterQuizDisplay from "../../../components/ChapterQuizDisplay";
import { useFirstViewImageGeneration } from "../../../hooks/useFirstViewImageGeneration";
import CoverImageEditor from '../../../components/CoverImageEditor/CoverImageEditor';


interface QuillEditor {
  getContents: () => Delta;
  setContents: (delta: Delta) => void;
  root: HTMLElement;
}

interface Delta {
  ops: Operation[];
}

interface Operation {
  insert?: string | { image: string } | any;
  attributes?: Record<string, any>;
}

const EditBookCreator = () => {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [convertingBlob, setConvertingBlob] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showCoverGenerator, setShowCoverGenerator] = useState(false); // NEW: separate state for cover generator
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [AIImage, setAiIMage] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(-1);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string>("");
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const [currentEditingImage, setCurrentEditingImage] = useState<string | null>(
    null
  );
  const [isGalleryVisible, setIsGalleryVisible] = useState(true);
  const [imageGallery, setImageGallery] = useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const [showEditConfirmation, setShowEditConfirmation] =
    useState<boolean>(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [chapterToDelete, setChapterToDelete] = useState<number>(-1);
  const [OpenQuizModal, setOpenQuizModal] = useState<boolean>(false);
  const [currentQuizContent, setCurrentQuizContent] = useState<{
    editorContent: string;
    sharedContent: string;
  } | null>(null);
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState(false);
  const [regeneratingQuestionIndex, setRegeneratingQuestionIndex] =
    useState<number>(-1);
  const [showLeaveConfirmation, setShowLeaveConfirmation] =
    useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [importingQuiz, setImportingQuiz] = useState<boolean>(false);
  const [quizUrl, setQuizUrl] = useState<string>("");
  const [isRefreshingCourse, setIsRefreshingCourse] = useState(false);
  const [hasQuizBeenImported, setHasQuizBeenImported] = useState(false);
  const [chapterQuiz, setChapterQuiz] = useState("");
  const [quizMessage, setQuizMessage] = useState("");
  const [OpenAdminModal, setOpenAdminModal] = useState<boolean>(false);
  // Add to your existing state variables
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [coverMode, setCoverMode] = useState(false);

  const {
    isFirstView,
    isChecking,
    isGenerating,
    generatedImage,
    error: imageGeneration,
    manuallyGenerateImage,
  } = useFirstViewImageGeneration(id);

  // Add a single useEffect to automatically apply the cover image when it's available from the hook
  useEffect(() => {
    // Skip if any of these conditions are met:
    // - No course ID
    // - Loading state
    // - Already in the middle of an operation
    if (!id || loading || operationInProgress) {
      return;
    }

    // Skip if we already have a cover image
    const hasCover = chapters.some((chapter: any) =>
      typeof chapter === "string"
        ? isCoverChapter(chapter)
        : chapter?.content && isCoverChapter(chapter.content)
    );

    // If this is the first view and we have a generated image URL, apply it as cover
    if (isFirstView && generatedImage && !hasCover) {
      console.log("Auto-applying generated cover image:", generatedImage);

      // Use a special silent version for auto-generated covers
      handleAddCoverImageSilently(generatedImage);
    }
  }, [id, isFirstView, generatedImage, loading, chapters, operationInProgress]);

  // Silent version of handleAddCoverImage without toasts for automatic generation
  const handleAddCoverImageSilently = async (imageUrl: string) => {
    setImageGallery(false);
    if (coverMode) {
      setCoverMode(false);
    }

    return performOperation(
      "adding_cover",
      async () => {
        const coverContent = generateCoverContent(imageUrl);

        // Check if we already have a cover
        const existingCoverIndex = chapters.findIndex((chapter: any) =>
          typeof chapter === "string"
            ? isCoverChapter(chapter)
            : chapter?.content && isCoverChapter(chapter.content)
        );

        const hadCover = existingCoverIndex !== -1;

        // Determine if we're currently on the cover
        const wasOnCover =
          selectedChapterIndex === existingCoverIndex && hadCover;

        // Remember which actual chapter content we're currently editing
        const currentChapterContent = selectedChapter;
        const currentTitle = selectedChapterTitle;

        // Remove any existing cover chapter
        let updatedChapters = [...chapters].filter((chapter: any) =>
          typeof chapter === "string"
            ? !isCoverChapter(chapter)
            : !isCoverChapter(chapter.content)
        );

        // Find what "real" chapter index we're on (ignoring cover)
        const realChapterIndex =
          hadCover && selectedChapterIndex > existingCoverIndex
            ? selectedChapterIndex - 1 // Adjust if we had a cover
            : selectedChapterIndex; // Otherwise use current index

        // Insert the new cover as the first item
        updatedChapters.unshift({
          title: "Cover Image",
          content: coverContent,
        } as any);

        // Save to server
        const response = await apiService.post(
          `/course-creator/updateCourse/${id}/course`,
          {
            content: JSON.stringify(updatedChapters),
          }
        );

        if (!response.success) {
          throw new Error("Failed to save cover");
        }

        // Update chapters state
        setChapters(updatedChapters);

        // Update selection state
        if (wasOnCover || selectedChapterIndex === -1) {
          // If we were on a cover or had nothing selected, select the new cover
          setSelectedChapterIndex(0);
          setSelectedChapter(coverContent);
          setSelectedChapterTitle("Cover Image");
        } else {
          // Otherwise, adjust our index to stay on the same content chapter
          const newIndex = realChapterIndex + 1; // +1 for the new cover

          if (newIndex < updatedChapters.length) {
            setSelectedChapterIndex(newIndex);

            // Make sure the chapter content display is correct
            const newChapter = updatedChapters[newIndex] as any;
            if (typeof newChapter === "object" && newChapter.content) {
              // Don't change content if we're staying on the same chapter
              // This preserves any unsaved edits the user was making
              if (newChapter.content !== currentChapterContent) {
                setSelectedChapter(newChapter.content);
              }
              setSelectedChapterTitle(newChapter.title || "");
            } else if (typeof newChapter === "string") {
              if (newChapter !== currentChapterContent) {
                setSelectedChapter(newChapter);
              }
              setSelectedChapterTitle("");
            }
          }
        }

        return true;
      },
      {
        showToast: false, // No toast for automatic generation
        successMessage: "",
        errorMessage: "",
      }
    );
  };

  // to show when auto-cover generation is in progress
  const AutoCoverIndicator = () => {
    // Ref to track if we've shown the success message
    const successShownRef = useRef(false);

    // Reset indicator if not in first view
    if (!isFirstView) return null;

    // Auto-hide success message after a delay
    useEffect(() => {
      if (generatedImage && !successShownRef.current) {
        successShownRef.current = true;

        // Hide the success indicator after 5 seconds
        const timer = setTimeout(() => {
          successShownRef.current = false;
        }, 5000);

        return () => clearTimeout(timer);
      }
    }, [generatedImage]);

    if (isGenerating) {
      return (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md flex items-center gap-3 animate-pulse">
          <div className="shrink-0 w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <p className="text-sm font-medium text-purple-700">
              Generating cover...
            </p>
            <p className="text-xs text-purple-600">
              We're creating a beautiful cover for your content
            </p>
          </div>
        </div>
      );
    }

    if (generatedImage && successShownRef.current) {
      return (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-3 animate-fadeIn">
          <div className="shrink-0 w-6 h-6 text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-green-700">
              Cover created successfully!
            </p>
            <p className="text-xs text-green-600">
              An AI-generated cover has been added to your course
            </p>
          </div>
        </div>
      );
    }

    if (isChecking) {
      return (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-3">
          <div className="shrink-0 w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-blue-700">
            Checking if your course needs a cover...
          </p>
        </div>
      );
    }

    if (imageGeneration) {
      return (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-3">
          <div className="shrink-0 w-6 h-6 text-amber-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-amber-700">
              Couldn't generate cover
            </p>
            <p className="text-xs text-amber-600">{imageGeneration}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  const toggleAdminModel = () => {
    if (operationInProgress) {
      toast.error("Please wait for the current operation to complete");
      return;
    }
    setOpenAdminModal(!OpenAdminModal);
  };

  const toggleQuizModal = () => {
    if (operationInProgress) {
      toast.error("Please wait for the current operation to complete");
      return;
    }
    setOpenQuizModal(!OpenQuizModal);
  };

  // --- Modal Handlers ---
  const handleOpenImageGenerator = () => {
    setShowImageGenerator(true);
    setImageGallery(false);
  };

  const handleCloseImageGenerator = () => {
    setShowImageGenerator(false);
    setImageGallery(true); // Return to gallery when closing editor image generator
  };
  const handleOpenCoverGenerator = () => {
    setShowCoverGenerator(true);
    setImageGallery(false);
  };
  const handleCloseCoverGenerator = () => {
    setShowCoverGenerator(false);
  };

  const handleImageClick = (imageUrl: string) => {
    setPendingImageUrl(imageUrl);
    setShowEditConfirmation(true);
    setOpenEditor(false);
    setCurrentEditingImage(null);
  };

  const handleConfirmEdit = () => {
    if (pendingImageUrl) {
      setCurrentEditingImage(pendingImageUrl);
      setOpenEditor(true);
    }
    setShowEditConfirmation(false);
  };

  const handleCancelEdit = () => {
    setPendingImageUrl(null);
    setShowEditConfirmation(false);
  };

  const performOperation = async (
    operationName: string,
    operation: () => Promise<any>,
    options = { showToast: true, successMessage: "", errorMessage: "" }
  ) => {
    // If another operation is in progress, prevent this one
    if (operationInProgress) {
      if (options.showToast) {
        toast.error("Please wait for the current operation to complete");
      }
      return null;
    }

    // Set operation state
    setCurrentOperation(operationName);
    setOperationInProgress(true);

    try {
      // Perform the operation
      const result = await operation();

      // Show success toast if needed
      if (options.showToast && options.successMessage) {
        toast.success(options.successMessage);
      }

      return result;
    } catch (error) {
      console.error(`Error during ${operationName}:`, error);

      // Show error toast if needed
      if (options.showToast) {
        toast.error(options.errorMessage || `Error during ${operationName}`);
      }

      return null;
    } finally {
      // Reset operation state
      setCurrentOperation(null);
      setOperationInProgress(false);
    }
  };

  // Add this to check if current chapter is a cover
const isCurrentChapterCover = () => {
  if (selectedChapterIndex === -1) return false;
  
  const currentChapter = chapters[selectedChapterIndex];
  if (typeof currentChapter === 'string') {
    return isCoverChapter(currentChapter);
  } else if (currentChapter && typeof currentChapter === 'object' && 'content' in currentChapter) {
    return isCoverChapter(currentChapter.content);
  }
  return false;
};

// Add this function to extract image URL from cover content
const extractCoverImageUrl = (coverContent: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(coverContent, 'text/html');
    const imgElement = doc.querySelector('img');
    return imgElement?.getAttribute('src') || '';
  } catch (error) {
    console.error('Error extracting cover image URL:', error);
    return '';
  }
};

// Add this handler for saving edited cover image
const handleCoverImageEdit = (editedImageUrl: string) => {
  const isCoverImage =
    selectedChapterIndex !== -1 &&
    chapters[selectedChapterIndex] &&
    ((typeof chapters[selectedChapterIndex] === "string" &&
      isCoverChapter(chapters[selectedChapterIndex])) ||
      (typeof chapters[selectedChapterIndex] === "object" &&
        "content" in chapters[selectedChapterIndex] &&
        isCoverChapter(
          (chapters[selectedChapterIndex] as { content?: string }).content ??
            ""
        )));

  // If this is a cover image, use the cover image handler
  if (isCoverImage) {
    // Close the editor first
    setOpenEditor(false);
    setCurrentEditingImage(null);

    // Then update the cover with the edited image
    handleAddCoverImage(editedImageUrl);
  }
};

  const toggleGallery = () => setIsGalleryVisible(!isGalleryVisible);
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response: any = await apiService.get(
          `/book-creator/getBookById/${id}`,
          {}
        );
        setCourseData(response.data);

        if (
          response.data?.content &&
          response.data?.content !== "null" &&
          response.data?.content !== "undefined" &&
          response.data?.content !== ""
        ) {
          try {
            const parsed = JSON.parse(response.data.content);
            let parsedChapters = [];

            if (typeof parsed === "string") {
              const again = JSON.parse(parsed);
              parsedChapters = again;
              setSelectedChapter(parsedChapters[0]);
            } else {
              parsedChapters = parsed;
              setSelectedChapter(parsedChapters[0]?.content);
            }

            setChapters(parsedChapters);

            // NEW CODE: Check if cover_location exists and no cover chapter exists yet
            const hasCoverChapter = parsedChapters.some((chapter: any) => {
              if (typeof chapter === "string") {
                return isCoverChapter(chapter);
              } else if (chapter && typeof chapter === "object") {
                return chapter.content && isCoverChapter(chapter.content);
              }
              return false;
            });

            // If cover_location exists in the response but we don't have a cover chapter yet, create one
            if (response.data?.cover_location && !hasCoverChapter) {
              const coverImageUrl = response.data.cover_location;

              // Ensure URL is properly formatted
              const fullCoverUrl = coverImageUrl.startsWith("http")
                ? coverImageUrl
                : `https://minilessonsacademy.com${
                    coverImageUrl.startsWith("/") ? "" : "/"
                  }${coverImageUrl}`;

              // Generate cover content
              const coverContent = generateCoverContent(fullCoverUrl);

              // Insert at beginning of chapters array
              const updatedChaptersWithCover = [...parsedChapters];
              updatedChaptersWithCover.unshift(
                typeof coverContent === "string"
                  ? coverContent
                  : JSON.stringify(coverContent)
              );

              // Update state
              setChapters(updatedChaptersWithCover);
              setSelectedChapter(updatedChaptersWithCover[0]);
              // Save the updated chapters to the server
              try {
                await apiService.post(
                  `/course-creator/updateCourse/${id}/book`,
                  {
                    content: JSON.stringify(updatedChaptersWithCover),
                  }
                );

                console.log(
                  "Book cover chapter added from cover_location:",
                  fullCoverUrl
                );
              } catch (coverError) {
                console.error("Error saving book cover chapter:", coverError);
              }
            }
          } catch (e) {
            console.error("Error parsing book content", e);
            setChapters([]);
          }
        } else if (response.data?.blob_location) {
          // If content is null but blob_location exists, convert blob to chapters
          setConvertingBlob(true);
          try {
            const blobResponse = await apiService.post(
              "/course-creator/convert-blob-to-chapters",
              {
                blobUrl: response.data.blob_location,
              }
            );

            if (blobResponse.success) {
              // Update the book with the new content
              const updateResponse = await apiService.post(
                `/course-creator/updateCourse/${id}/book`,
                {
                  content: JSON.stringify(blobResponse.data.chapters),
                }
              );

              if (updateResponse.success) {
                setChapters(blobResponse.data.chapters);
                setSelectedChapter(blobResponse.data.chapters[0]);
              } else {
                throw new Error("Failed to update book with converted content");
              }
            } else {
              throw new Error(
                blobResponse.message || "Failed to convert blob to chapters"
              );
            }
          } catch (err: any) {
            setError(err.message || "Error converting blob to chapters");
          } finally {
            setConvertingBlob(false);
          }
        }

        // Check for quiz_location and convert external quiz if it exists
        if (response.data?.quiz_location && !hasQuizBeenImported) {
          const quizFinalUrl = response?.data?.quiz_location.includes(
            "minilessonsacademy"
          )
            ? response?.data?.quiz_location
            : `https://minilessonsacademy.com/${response?.data?.quiz_location}`;
          try {
            const quizResponse = await apiService.post(
              "/course-creator/convert-external-quiz",
              {
                quizUrl: quizFinalUrl,
              }
            );

            if (quizResponse.success) {
              setHasQuizBeenImported(true);
              setIsRefreshingCourse(true);
              // Fetch book again to get updated content with quizzes
              const updatedResponse = await apiService.get(
                `/book-creator/getBookById/${id}`,
                {}
              );
              if (updatedResponse.data?.content) {
                try {
                  const parsed = JSON.parse(updatedResponse.data.content);
                  if (typeof parsed === "string") {
                    const again = JSON.parse(parsed);
                    setChapters(again);
                    setSelectedChapter(again[0].content);
                  } else {
                    setChapters(parsed);
                    setSelectedChapter(parsed[0]);
                  }
                } catch (e) {
                  console.error("Error parsing updated book content", e);
                }
              }
            }
          } catch (error) {
            console.error("Error converting external quiz:", error);
            toast.error("Error converting external quiz");
          } finally {
            setIsRefreshingCourse(false);
          }
        }
      } catch (err: any) {
        setError(err.message || "Error fetching book data");
      } finally {
        setLoading(false);
      }
    };

    if (id && !isRefreshingCourse) {
      fetchBook();
    }
  }, [id, hasQuizBeenImported, isRefreshingCourse]);

  const handleAIImageSelect = (imageUrl: string) => {
    setAiIMage(imageUrl);
    setShowImageGenerator(false);
  };

  const handleContentChange = (newContent: string) => {
    if (newContent !== selectedChapter) {
      setHasUnsavedChanges(true);
    }
    setSelectedChapter(newContent);
  };

  const handleChapterSelect = async (chapterContent: any, index: number) => {
    // If we're already loading a chapter, prevent selection
    if (currentOperation === "loading_chapter") return;

    // Auto-save current chapter if there are unsaved changes
    if (hasUnsavedChanges && selectedChapterIndex !== -1) {
      await performOperation("saving_chapter", async () => handleSave(false), {
        showToast: false,
        successMessage: "Changes saved before switching chapters",
        errorMessage: "Failed to save changes before switching",
      });
    }

    // Add this function to standardize chapter format
    const standardizeChapterFormat = (chapter: any) => {
      // If chapter is a string, convert to object
      if (typeof chapter === "string") {
        const isCover = isCoverChapter(chapter);
        return {
          title: isCover ? "Cover Image" : "Untitled Chapter",
          content: chapter,
        };
      }
      // If chapter is already an object with content property, return as is
      else if (
        typeof chapter === "object" &&
        chapter !== null &&
        chapter.content
      ) {
        return chapter;
      }
      // Fallback for unexpected formats
      else {
        console.error("Unexpected chapter format:", chapter);
        return { title: "Untitled Chapter", content: "" };
      }
    };

    // Standardize chapter format before processing
    const standardizedChapter = standardizeChapterFormat(chapterContent);

    // Now load the selected chapter with consistent object structure
    await performOperation(
      "loading_chapter",
      async () => {
        setSelectedChapterTitle(standardizedChapter.title);
        setSelectedChapter(standardizedChapter.content);

        if (standardizedChapter.quiz) {
          setChapterQuiz(standardizedChapter.quiz);

          if (
            standardizedChapter.quiz.editorContent &&
            standardizedChapter.quiz.sharedContent
          ) {
            setCurrentQuizContent(standardizedChapter.quiz);
          } else {
            setCurrentQuizContent(null);
          }
        } else {
          setChapterQuiz("");
          setCurrentQuizContent(null);
        }

        setSelectedChapterIndex(index);
      },
      { showToast: false } as any
    );
  };

  const handleSave = async (deleteQuiz: boolean) => {
    return performOperation(
      "saving_content",
      async () => {
        if (selectedChapterIndex === -1) return false;

        const updatedChapters = [...chapters];

        const currentChapter = chapters[selectedChapterIndex] as any;
        const isCover =
          typeof currentChapter === "string"
            ? isCoverChapter(currentChapter)
            : currentChapter &&
              typeof currentChapter === "object" &&
              "content" in currentChapter
            ? isCoverChapter(currentChapter.content)
            : false;

        // Use special handling for cover chapters
        const updatedContent = isCover
          ? {
              title: "Cover Image", // Preserve the cover title
              content: selectedChapter,
              ...(currentQuizContent && { quiz: currentQuizContent }),
            }
          : (handleContentUpdate(
              selectedChapter,
              selectedChapterTitle,
              Boolean(currentQuizContent),
              chapters[selectedChapterIndex],
              currentQuizContent
            ) as any);

        if (deleteQuiz) {
          updatedContent.quiz = null;
          setCurrentQuizContent(null);
          setChapterQuiz("");
        }

        updatedChapters[selectedChapterIndex] = updatedContent;

        const response = await apiService.post(
          `/course-creator/updateCourse/${id}/book`,
          {
            content: Array.isArray(updatedChapters)
              ? JSON.stringify(updatedChapters)
              : updatedChapters,
          }
        );

        if (response.success) {
          setChapters(updatedChapters);
          setHasUnsavedChanges(false);
          return true;
        } else {
          throw new Error("Failed to save changes");
        }
      },
      {
        showToast: true,
        successMessage: deleteQuiz
          ? "Quiz removed and changes saved"
          : "Changes saved successfully",
        errorMessage: "Failed to save changes",
      }
    );
  };


  const handleEnhanceText = async (selectedText: string, fullContent: string, operation:any) => {
  try {
    // Show loading toast
    const loadingToast = toast.loading("Enhancing text with AI...");
    
    // Call the API to enhance the text
    const response = await apiService.post("/ai/enhance-text", {
      selectedText,
      fullContent,
      contentType: "book",
      contentId: id,
      operationName: operation
    });
    
    // Close loading toast
    toast.dismiss(loadingToast);
    
    if (response.success && response.data) {
      toast.success("Text enhanced successfully!");
      return response.data.enhancedText;
    } else {
      throw new Error(response.message || "Failed to enhance text");
    }
  } catch (error) {
    console.error("Error enhancing text:", error);
    toast.error("Failed to enhance text. Please try again.");
    return selectedText; // Return original text if enhancement fails
  }
};

  const handleEditedImageSave = (editedImageUrl: string): void => {
    // Check if we're editing a cover image
    const isCoverImage =
      selectedChapterIndex !== -1 &&
      chapters[selectedChapterIndex] &&
      ((typeof chapters[selectedChapterIndex] === "string" &&
        isCoverChapter(chapters[selectedChapterIndex])) ||
        (typeof chapters[selectedChapterIndex] === "object" &&
          "content" in chapters[selectedChapterIndex] &&
          isCoverChapter(
            (chapters[selectedChapterIndex] as { content?: string }).content ??
              ""
          )));

    // If this is a cover image, use the cover image handler
    if (isCoverImage) {
      // Close the editor first
      setOpenEditor(false);
      setCurrentEditingImage(null);

      // Then update the cover with the edited image
      handleAddCoverImage(editedImageUrl);
      return;
    }

    // Otherwise, handle as a regular embedded image
    if (!quillRef.current || !currentEditingImage) return;

    const editor = quillRef.current.getEditor();
    if (!editor) return;

    const range = editor.getSelection();
    const delta = editor.getContents();

    const updatedDelta = updateEditorImage(
      delta,
      currentEditingImage,
      editedImageUrl
    );

    editor.setContents(updatedDelta as any);
    if (range) editor.setSelection(range.index, range.length);

    handleContentChange(editor.root.innerHTML);
    handleSave(false);

    setOpenEditor(false);
    setCurrentEditingImage(null);
  };

  const handleAddCoverImage = async (imageUrl: string) => {
    setImageGallery(false);
    return performOperation(
      "adding_cover",
      async () => {
        const coverContent = generateCoverContent(imageUrl);

        // Check if we already have a cover
        const existingCoverIndex = chapters.findIndex((chapter: any) =>
          typeof chapter === "string"
            ? isCoverChapter(chapter)
            : chapter?.content && isCoverChapter(chapter.content)
        );

        const hadCover = existingCoverIndex !== -1;

        // Determine if we're currently on the cover
        const wasOnCover =
          selectedChapterIndex === existingCoverIndex && hadCover;

        // Remember which actual chapter content we're currently editing
        const currentChapterContent = selectedChapter;
        const currentTitle = selectedChapterTitle;

        // Remove any existing cover chapter
        let updatedChapters = [...chapters].filter((chapter: any) =>
          typeof chapter === "string"
            ? !isCoverChapter(chapter)
            : !isCoverChapter(chapter.content)
        );

        // Find what "real" chapter index we're on (ignoring cover)
        const realChapterIndex =
          hadCover && selectedChapterIndex > existingCoverIndex
            ? selectedChapterIndex - 1 // Adjust if we had a cover
            : selectedChapterIndex; // Otherwise use current index

        // Insert the new cover as the first item
        updatedChapters.unshift({
          title: "Cover Image",
          content: coverContent,
        } as any);

        // Save to server
        const response = await apiService.post(
          `/course-creator/updateCourse/${id}/book`,
          {
            content: JSON.stringify(updatedChapters),
          }
        );

        if (!response.success) {
          throw new Error("Failed to save cover");
        }

        // Update chapters state
        setChapters(updatedChapters);

        // Update selection state
        if (wasOnCover || selectedChapterIndex === -1) {
          // If we were on a cover or had nothing selected, select the new cover
          setSelectedChapterIndex(0);
          setSelectedChapter(coverContent);
          setSelectedChapterTitle("Cover Image");
        } else {
          // Otherwise, adjust our index to stay on the same content chapter
          const newIndex = realChapterIndex + 1; // +1 for the new cover

          if (newIndex < updatedChapters.length) {
            setSelectedChapterIndex(newIndex);

            // Make sure the chapter content display is correct
            const newChapter = updatedChapters[newIndex] as any;
            if (typeof newChapter === "object" && newChapter.content) {
              // Don't change content if we're staying on the same chapter
              // This preserves any unsaved edits the user was making
              if (newChapter.content !== currentChapterContent) {
                setSelectedChapter(newChapter.content);
              }
              setSelectedChapterTitle(newChapter.title || "");
            } else if (typeof newChapter === "string") {
              if (newChapter !== currentChapterContent) {
                setSelectedChapter(newChapter);
              }
              setSelectedChapterTitle("");
            }
          }
        }

        return true;
      },
      {
        showToast: true,
        successMessage: "Course cover added successfully",
        errorMessage: "Failed to add course cover",
      }
    );
  };

  // const handleRemoveCoverImage = async () => {
  //   try {
  //     const coverIndex = chapters.findIndex((chapter) =>
  //       isCoverChapter(chapter)
  //     );
  //     if (coverIndex < 0) {
  //       toast.error("No cover image found");
  //       return;
  //     }
  //     const updatedChapters = [...chapters];
  //     updatedChapters.splice(coverIndex, 1);
  //     const response = await apiService.post(
  //       `/course-creator/updateCourse/${id}/book`,
  //       {
  //         content: JSON.stringify(updatedChapters),
  //       }
  //     );
  //     if (response.success) {
  //       setChapters(updatedChapters);
  //       if (updatedChapters.length > 0) {
  //         handleChapterSelect(updatedChapters[0], 0);
  //       } else {
  //         setSelectedChapter("");
  //         setSelectedChapterTitle("");
  //         setSelectedChapterIndex(-1);
  //       }
  //       toast.success("Book cover removed successfully");
  //     } else {
  //       toast.error("Failed to remove book cover");
  //     }
  //   } catch (error) {
  //     toast.error("Error removing book cover");
  //   }
  // };

  const handleRemoveCoverImage = async () => {
    return performOperation(
      "removing_cover",
      async () => {
        // Find the cover chapter index using the enhanced isCoverChapter function
        const coverIndex = chapters.findIndex((chapter: any) => {
          if (typeof chapter === "object" && chapter.content) {
            return isCoverChapter(chapter.content);
          }
          return isCoverChapter(chapter);
        });

        if (coverIndex < 0) {
          throw new Error("No cover image found");
        }

        // Create a COPY of the chapters array
        const updatedChapters = [...chapters];

        // Remove the cover chapter
        updatedChapters.splice(coverIndex, 1);

        // Make the API call - important to send cover_location: null
        const response = await apiService.post(
          `/course-creator/updateCourse/${id}/book`,
          {
            content: JSON.stringify(updatedChapters),
            cover_location: null, // Explicitly clear cover_location
          }
        );

        if (!response.success) {
          throw new Error("Failed to remove course cover");
        }

        // Update the local state with the new chapters
        setChapters(updatedChapters);

        // Handle chapter selection after cover removal
        if (coverIndex === selectedChapterIndex) {
          if (updatedChapters.length > 0) {
            // Directly update state instead of calling handleChapterSelect
            // to avoid nested operations
            const nextChapter = updatedChapters[0] as any;
            if (typeof nextChapter === "object" && nextChapter.content) {
              setSelectedChapter(nextChapter.content);
              setSelectedChapterTitle(nextChapter.title || "");
            } else {
              setSelectedChapter(
                typeof nextChapter === "string" ? nextChapter : ""
              );
              setSelectedChapterTitle("");
            }
            setSelectedChapterIndex(0);
          } else {
            setSelectedChapter("");
            setSelectedChapterTitle("");
            setSelectedChapterIndex(-1);
          }
        } else if (coverIndex < selectedChapterIndex) {
          // If the cover was before the selected chapter, adjust the index
          setSelectedChapterIndex(selectedChapterIndex - 1);
        }

        // Force a refresh of the courseData
        const refreshResponse = await apiService.get(
          `/course-creator/getCourseById/${id}/book`,
          {}
        );

        if (refreshResponse.success) {
          setCourseData(refreshResponse.data);
        }

        return true;
      },
      {
        showToast: true,
        successMessage: "Course cover removed successfully",
        errorMessage: "Failed to remove course cover",
      }
    );
  };
  const handleDeleteChapter = (index: number) => {
    setChapterToDelete(index);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (chapterToDelete === -1) return;

    try {
      const updatedChapters = [...chapters];
      updatedChapters.splice(chapterToDelete, 1);

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/book`,
        {
          content: JSON.stringify(updatedChapters),
        }
      );

      if (response.success) {
        setChapters(updatedChapters);

        if (chapterToDelete === selectedChapterIndex) {
          if (updatedChapters.length > 0) {
            handleChapterSelect(updatedChapters[0], 0);
          } else {
            setSelectedChapter("");
            setSelectedChapterTitle("");
            setSelectedChapterIndex(-1);
          }
        } else if (chapterToDelete < selectedChapterIndex) {
          setSelectedChapterIndex(selectedChapterIndex - 1);
        }

        toast.success("Chapter deleted successfully");
      } else {
        toast.error("Failed to delete chapter");
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
      toast.error("Error deleting chapter");
    } finally {
      setShowDeleteConfirmation(false);
      setChapterToDelete(-1);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setChapterToDelete(-1);
  };

  const handleSaveQuiz = async (
    editorQuizHTML: string,
    sharedQuizHTML: string
  ) => {
    await performOperation(
      "saving_quiz",
      async () => {
        // Store quiz content in state
        setCurrentQuizContent({
          editorContent: editorQuizHTML,
          sharedContent: sharedQuizHTML,
        });

        // Format the chapter content with the quiz
        const updatedChapters = [...chapters];
        const finalChapterContent = formatQuizContent(
          editorQuizHTML,
          sharedQuizHTML,
          selectedChapterTitle,
          selectedChapter
        );

        updatedChapters[selectedChapterIndex] = finalChapterContent;

        // Save to API
        const response = await apiService.post(
          `/course-creator/updateCourse/${id}/book`,
          {
            content: JSON.stringify(updatedChapters),
          }
        );

        if (response.success) {
          setChapters(updatedChapters);
          setOpenQuizModal(false);
          return true;
        } else {
          throw new Error("Failed to save quiz");
        }
      },
      {
        showToast: true,
        successMessage: "Quiz added to chapter successfully!",
        errorMessage: "Failed to save quiz to chapter",
      }
    );
  };

  const handleAddChapter = async (title: string) => {
    setLoading(true);
    const hasCover = chapters.some((chapter: any) =>
      typeof chapter === "string"
        ? isCoverChapter(chapter)
        : chapter?.content && isCoverChapter(chapter.content)
    );
    try {
      const response = await apiService.post(
        `/course-creator/addChapter/${id}/course`,
        {
          courseId: id,
          chapterTitle: title,
          courseContent: chapters.map((c: any) => c.content).join("\n"),
          chapterNumber: hasCover ? chapters.length : chapters.length + 1,
        }
      );
      if (response.success) {
        const newChapter = { title: title, content: response.data };
        setChapters([...chapters, newChapter]);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error adding chapter:", error);
    } finally {
      toast.success("Chapter added successfully");
      setLoading(false);
    }
  };

  const handleRegenerateQuestion = async (questionIndex: number) => {
    if (!selectedChapter || !currentQuizContent) {
      toast.error("No quiz content available");
      return;
    }
    setRegeneratingQuestionIndex(questionIndex);
    try {
      const originalQuizContent = { ...currentQuizContent };
      const parser = new DOMParser();
      const doc = parser.parseFromString(selectedChapter, "text/html");
      const quizSections = doc.querySelectorAll("h2");
      quizSections.forEach((section) => {
        if (section.textContent?.trim().toLowerCase() === "exercises") {
          let currentNode = section as any;
          const nodesToRemove = [];
          nodesToRemove.push(currentNode);
          while (currentNode.nextElementSibling) {
            currentNode = currentNode.nextElementSibling;
            nodesToRemove.push(currentNode);
            if (currentNode.tagName === "H2") break;
          }
          nodesToRemove.forEach((node) => {
            if (node.parentNode) node.parentNode.removeChild(node);
          });
        }
      });
      const cleanContent = doc.body.innerHTML;
      const textContent = doc.body.textContent || "";
      const quizType = determineQuizType(currentQuizContent.sharedContent);

      const response = await apiService.post(
        "/generate-quiz",
        {
          chapterContent: textContent,
          quizType,
          questionCount: 1,
          preserveStructure: true,
          questionIndex,
        },
        { timeout: 60000 }
      );

      if (response.success && response.data) {
        try {
          const formattedQuiz = await formatQuizHTML({
            ...response.data,
            existingQuiz: currentQuizContent,
            replaceQuestionIndex: questionIndex,
          });
          let editorContent = formattedQuiz.editorQuizHTML;
          if (!editorContent.trim().startsWith("<h2>Exercises</h2>")) {
            editorContent = `<h2>Exercises</h2>${editorContent}`;
          }
          setCurrentQuizContent({
            editorContent: editorContent,
            sharedContent: formattedQuiz.sharedQuizHTML,
          });
          const updatedChapters = [...chapters];
          const finalChapterContent = formatQuizContent(
            editorContent,
            formattedQuiz.sharedQuizHTML,
            selectedChapterTitle,
            cleanContent
          );
          updatedChapters[selectedChapterIndex] = finalChapterContent;
          const saveResponse = await apiService.post(
            `/course-creator/updateCourse/${id}/book`,
            {
              content: JSON.stringify(updatedChapters),
            }
          );
          if (saveResponse.success) {
            setChapters(updatedChapters);
            setSelectedChapter(cleanContent);
          } else {
            setCurrentQuizContent(originalQuizContent);
            toast.error("Failed to save regenerated question");
          }
        } catch (error) {
          console.error("Error processing regenerated question:", error);
          setCurrentQuizContent(originalQuizContent);
          toast.error("Failed to process regenerated question");
        }
      } else {
        toast.error(response.message || "Failed to regenerate question");
      }
    } catch (error) {
      console.error("Error regenerating question:", error);
      toast.error("Error regenerating question");
    } finally {
      setRegeneratingQuestionIndex(-1);
    }
  };

  const handleImageGeneration = () => {
    setImageGallery(false);
    setShowImageGenerator(true);
  };

  const handleDeleteQuiz = async () => {
    if (selectedChapterIndex === -1 || !currentQuizContent) {
      toast.error("No quiz available to delete");
      return;
    }

    setCurrentQuizContent(null);
    setChapterQuiz("");
    handleSave(true);
  };

  const handleChapterHeadingEdit = async (
    chapter: string,
    newTitle: string,
    index: number
  ) => {
    if (chapter.includes("<h1")) {
      chapter = chapter.replace(/<h1[^>]*>.*?<\/h1>/, `<h1>${newTitle}</h1>`);
      const updatedChapters = [...chapters];
      setSelectedChapter(chapter);

      const editedChapter = handleContentUpdate(
        chapter,
        newTitle,
        Boolean(currentQuizContent),
        chapters[selectedChapterIndex],
        currentQuizContent
      );

      updatedChapters[selectedChapterIndex] = editedChapter;

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/book`,
        {
          content: JSON.stringify(updatedChapters),
        }
      );

      if (response.success) {
        setChapters(updatedChapters);
        setHasUnsavedChanges(false);
        toast.success("Chapter title updated successfully");
      } else {
        toast.error("Failed to update chapter title");
      }
    } else {
      toast.error("Cannot update title: No h1 tag found in chapter");
    }
  };

  const embedContent = () => {
    const iframe = `<iframe src="https://app.minilessonsacademy.com/shared/book/${id}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    navigator.clipboard
      .writeText(iframe)
      .then(() => {
        toast.success(`HTML Copied for Course ID : ${id}`);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  useEffect(() => {
    // Confirmation handler for when user tries to navigate away
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        setShowLeaveConfirmation(true);
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        setShowLeaveConfirmation(true);
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleConfirmLeave = async () => {
    await handleSave(false);
    setShowLeaveConfirmation(false);
    navigate("/dashboard");
  };

  const handleCancelLeave = () => {
    setShowLeaveConfirmation(false);
  };

  const handleCoverImageSelect = (imageUrl: string) => {
    console.log("Cover image selected:", imageUrl);
    // Close the modal
    setShowCoverGenerator(false);

    // Add the selected image as a cover
    handleAddCoverImage(imageUrl);
  };

  if (loading || convertingBlob)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <div className="relative">
          <Book className="w-12 h-12 text-primary/20 animate-pulse" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-700">
          {convertingBlob
            ? "Converting content to chapters..."
            : "Loading book content..."}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {convertingBlob
            ? "Please wait while we process your book content"
            : "Please wait while we prepare your book editor"}
        </p>
        <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary/80 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <React.Fragment>
      {/* Opration in progress loader */}
      {operationInProgress && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-lg">
                {currentOperation === "saving_content"
                  ? "Saving changes..."
                  : currentOperation === "saving_quiz"
                  ? "Adding quiz..."
                  : currentOperation === "loading_chapter"
                  ? "Loading chapter..."
                  : "Operation in progress..."}
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Main container with responsive layout changes */}
      <div className="flex flex-col p-2 md:p-4 gap-4 lg:gap-6 max-w-full overflow-hidden">
        {/* Mobile sticky header with essential actions */}
        <div className="md:hidden sticky top-0 z-20 bg-white py-2 px-3 border-b border-purple-100 shadow-sm flex flex-col-reverse gap-4 justify-between">
          <div className="flex items-center justify-center">
            {courseData?.course_title ? (
              <h1 className="text-lg max-w-[200px] text-center text-gray-800  mx-2 flex-1 ">
                {courseData.course_title}
              </h1>
            ) : (
              <div className="h-5 flex-1 mx-2 animate-pulse bg-gray-200 rounded"></div>
            )}
          </div>

          <div className="flex gap-2 justify-between">
            <BackButton
              onBeforeNavigate={() => {
                const confirmed = window.confirm(
                  "Are you sure you want to go back to the dashboard?"
                );
                return true;
              }}
              label="Back"
              className="flex-shrink-0"
              href="/dashboard"
            />
            <Button
              variant="outline"
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all duration-200 flex items-center gap-1 px-3 py-1.5"
              onClick={() => handleSave(false)}
            >
              <Save className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-medium">Save</span>
            </Button>
          </div>
        </div>
        {/* Desktop header with all tools */}
        <div className="hidden md:flex flex-col gap-2 sm:gap-0">
          <div className="flex justify-between">
            <BackButton
              onBeforeNavigate={async () => {
                const confirmed = window.confirm(
                  "Are you sure you want to go back to the dashboard?"
                );
                return true;
              }}
              label="Back to Dashboard"
              href="/dashboard"
            />
            <div className="flex flex-wrap justify-between gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={() => navigate(`/create-email-campaign/book/${id}`)}
              >
                <FileCode2Icon className="w-4 h-4" />
                <span className="text-xs whitespace-nowrap">
                  Email Campaign
                </span>
              </Button>
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={toggleAdminModel}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs whitespace-nowrap">Admin</span>
              </Button>
              {/* <Button
              variant="soft"
              size="sm"
              className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
              onClick={toggleQuizModal}
            >
              <PackagePlus className="w-4 h-4" />
              <span className="text-xs whitespace-nowrap">Create Quiz</span>
            </Button> */}

              <Button
                variant="soft"
                size="sm"
                className={`bg-gray-100 transition flex items-center gap-1 ${
                  operationInProgress
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-gray-200"
                }`}
                onClick={operationInProgress ? undefined : toggleQuizModal}
                disabled={operationInProgress}
              >
                <PackagePlus className="w-4 h-4" />
                <span className="text-xs whitespace-nowrap">Create Quiz</span>
              </Button>
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={() => navigate(`/create-audio/book/${id}`)}
              >
                <Music className="w-4 h-4" />
                <span className="text-xs whitespace-nowrap">Create Audio</span>
              </Button>
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={() => setImageGallery(!imageGallery)}
              >
                <ImagesIcon className="w-5 h-5 text-primary" />
                <span className="text-xs whitespace-nowrap">Media Library</span>
              </Button>
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={handleOpenCoverGenerator}
              >
                <Book className="w-4 h-4" />
                <span className="text-xs whitespace-nowrap">Book Cover</span>
              </Button>
              <Button
                variant="soft"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
                onClick={() => window.open(`/shared/book/${id}`, "_blank")}
                title="View live published version in new tab"
              >
                <ExternalLink className="w-4 h-4 text-primary" />
                <span className="text-xs whitespace-nowrap">Share Preview</span>
              </Button>

              {selectedChapterIndex !== -1 &&
                chapters[selectedChapterIndex] &&
                ((typeof chapters[selectedChapterIndex] === "string" &&
                  isCoverChapter(chapters[selectedChapterIndex])) ||
                  (typeof chapters[selectedChapterIndex] === "object" &&
                    "content" in chapters[selectedChapterIndex] &&
                    isCoverChapter(
                      (chapters[selectedChapterIndex] as { content?: string })
                        .content ?? ""
                    ))) && (
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={handleRemoveCoverImage}
                    className="bg-red-100 hover:bg-red-200 transition flex items-center gap-1"
                    title="Remove cover image"
                  >
                    <ShieldCloseIcon className="w-4 h-4 text-red-600" />
                    <span className="text-xs whitespace-nowrap">
                      Remove Cover
                    </span>
                  </Button>
                )}
             <Button
  size="sm"
  className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 px-4 py-2.5"
  onClick={() => handleSave(false)}
  title="Save your content changes"
>
  <Save className="w-4 h-4 text-white" />
  <span className="text-xs whitespace-nowrap">Save Content</span>
</Button>
            </div>
          </div>
          <div className="hidden md:block">
            <AutoCoverIndicator />
          </div>
        </div>
        {/* Mobile toolbar with additional actions - appears below the editor */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white p-2 border-t border-purple-100 shadow-lg flex flex-wrap justify-around">
          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/create-email-campaign/book/${id}`)}
              className="p-0 flex items-center justify-center"
            >
              <Mail className="w-5 h-5 text-primary" />
            </Button>
            <span className="text-[10px] text-gray-600 mt-1">Campaign</span>
          </div>
          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              // onClick={embedContent}
              onClick={toggleAdminModel}
              className="p-0 flex items-center justify-center"
            >
              <ShieldCheck className="w-5 h-5 text-primary" />
            </Button>
            <span className="text-[10px] text-gray-600 mt-1">Admin</span>
          </div>

          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleQuizModal}
              className="p-0 flex items-center justify-center"
            >
              <PackagePlus className="w-5 h-5 text-primary" />
            </Button>
            <span className="text-[10px] text-gray-600 mt-1">Quiz</span>
          </div>

          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/create-audio/book/${id}`)}
              className="p-0 flex items-center justify-center"
            >
              <Music className="w-5 h-5 text-primary" />
            </Button>
            <span className="text-[10px] text-gray-600 mt-1">Audio</span>
          </div>

          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setImageGallery(!imageGallery)}
              className="p-0 flex items-center justify-center"
            >
              <ImagesIcon className="w-5 h-5 text-primary" />
            </Button>
            <span className="text-[10px] text-gray-600 mt-1">Media</span>
          </div>
          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenCoverGenerator}
              className="p-0 flex items-center justify-center"
            >
              <Book className="w-5 h-5 text-primary" />
            </Button>
            <span className="text-[10px] text-gray-600 mt-1">Cover</span>
          </div>
          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`/shared/book/${id}`, "_blank")}
              className="p-0 flex items-center justify-center"
            >
              <ExternalLink className="w-5 h-5 text-primary" />
            </Button>
            <span className="text-[10px] text-gray-600 mt-1">Preview</span>
          </div>
          {/* 
          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageGenerator(!showImageGenerator)}
              className="p-0 flex items-center justify-center"
            >
              <ImageIcon className="w-5 h-5 text-primary" />
            </Button>
            <span className="text-[10px] text-gray-600 mt-1">Image</span>
          </div>
          
          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <GenerateCover
              onCoverImageGenerated={handleAddCoverImage}
              courseId={id}
              contentType={"course"}
              isMobile={true}
            />
            <span className="text-[10px] text-gray-600 mt-1">Cover</span>
          </div> */}

          {selectedChapterIndex !== -1 &&
            chapters[selectedChapterIndex] &&
            typeof chapters[selectedChapterIndex] === "string" &&
            (chapters[selectedChapterIndex].includes('data-cover="true"') ||
              chapters[selectedChapterIndex].includes("book-cover-image")) && (
              <div className="flex flex-col items-center justify-center px-2 py-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoverImage}
                  className="p-0 flex items-center justify-center"
                >
                  <ShieldCloseIcon className="w-5 h-5 text-red-500" />
                </Button>
                <span className="text-[10px] text-gray-600 mt-1">Remove</span>
              </div>
            )}
        </div>
        <div className="md:hidden mb-4">
          <AutoCoverIndicator />
        </div>

        {/* Main editor area and sidebar container */}
        <div className="flex flex-col md:flex-row gap-4 mb-16 md:mb-0">
          {/* Chapter gallery - responsive drawer */}
          <div className="w-full md:w-auto">
            <ChapterGallery
              chapters={chapters}
              onSelectChapter={handleChapterSelect}
              onDeleteChapter={handleDeleteChapter}
              onEditHeading={handleChapterHeadingEdit}
              isVisible={isGalleryVisible}
              onToggleVisibility={toggleGallery}
              isSelectionDisabled={operationInProgress}
              onAddChapter={handleAddChapter}
            />
          </div>

          {/* Main editing area - responsive width based on gallery visibility */}
          <div
            className={`p-2 sm:p-4 md:p-6 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out w-full 
              ${isGalleryVisible ? "md:flex-1" : "w-full"}`}
          >
        

            {/* Replace your existing RichTextEditor section with this */}
<div className="flex-grow overflow-auto pb-20 md:pb-0">
  {isCurrentChapterCover() ? (
    <div className="flex-1">
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <CoverImageEditor
          imageUrl={extractCoverImageUrl(selectedChapter)}
          onSave={(editedImageUrl) => {
            console.log("Cover image edited, updating...");
            handleCoverImageEdit(editedImageUrl);
          }}
        />
      </div>
    </div>
  ) : !selectedChapter ? (
    <div className="flex flex-col items-center justify-center h-[40vh] md:h-[50vh] text-center p-4">
      <div className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 text-purple-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
        No Chapter Selected
      </h2>
      <p className="text-sm text-gray-500 max-w-md">
        {isGalleryVisible
          ? "Please select a chapter from the side panel to start editing its content."
          : "Click the chapters button to view and select a chapter."}
      </p>
      {!isGalleryVisible && (
        <button
          onClick={toggleGallery}
          className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Book className="w-4 h-4" />
          Show Chapters
        </button>
      )}
    </div>
  ) : (
    <div className="flex-1">
      <RichTextEditor
        ref={quillRef}
        initialContent={selectedChapter}
        imageUrl={AIImage}
        id={Number(id)}
        onContentChange={handleContentChange}
        onSave={() => handleSave(false)}
        onImageClick={handleImageClick}
        onEnhanceText={handleEnhanceText}
      />
    </div>
  )}

  {/* Keep the existing quiz display code */}
  {chapterQuiz && chapterQuiz.length > 0 && (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <ChapterQuizDisplay
        quizContent={chapterQuiz}
        quizMessage={quizMessage}
      />
    </div>
  )}

  {currentQuizContent && (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Chapter Quiz
      </h3>
      <QuizDisplay
        quizContent={currentQuizContent}
        onRegenerateQuestion={handleRegenerateQuestion}
        regeneratingQuestionIndex={regeneratingQuestionIndex}
        onDeleteQuiz={handleDeleteQuiz}
      />
    </div>
  )}
</div>
          </div>
        </div>
      </div>
      {/* Modals and dialog boxes */}
      <Modal
        isOpen={openEditor}
        onClose={() => setOpenEditor(false)}
        title={"Edit Image"}
        maxWidth="max-w-6xl"
      >
        <ImageEditor
          initialImageUrl={currentEditingImage || ""}
          onSave={handleEditedImageSave}
          isCoverEdit={true}
        />
      </Modal>

      <Modal
        isOpen={showImageGenerator}
        onClose={handleCloseImageGenerator}
        title="Image Generator"
      >
        <ImageGenerator
          onImageSelect={handleAIImageSelect}
          isEditorContext={true}
          NotCover={true}
          contentType={"book"}
          courseId={id}
        />
      </Modal>
      <Modal
        isOpen={showCoverGenerator}
        onClose={handleCloseCoverGenerator}
        title="Generate Book Cover"
      >
        <ImageGenerator
          onImageSelect={handleCoverImageSelect}
          isEditorContext={false}
          NotCover={true}
          contentType={"book"}
          courseId={id}
          isCoverMode={true}
          onAddAsCover={handleCoverImageSelect}
        />
      </Modal>

      <Modal
        isOpen={imageGallery}
        onClose={() => setImageGallery(false)}
        title="Image Gallery"
      >
        <ImageGallery
          contentType="course"
          courseId={id}
          isEditorContext={true}
          onImageSelect={handleAIImageSelect}
          onCoverImageGenerated={handleAddCoverImage}
          handleImageGenerator={handleImageGeneration}
        />
      </Modal>

      <Modal
        isOpen={OpenQuizModal}
        onClose={toggleQuizModal}
        title="Create Quiz"
      >
        <GenerateQuiz
          selectedChapter={selectedChapter}
          onSaveQuiz={handleSaveQuiz}
        />
      </Modal>

      <Modal isOpen={OpenAdminModal} onClose={toggleAdminModel} title="Content Sharing & Embedding">
        <AdminModel
          iframeLink={`<iframe src="https://app.minilessonsacademy.com/shared/book/${id}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`}
          preview={`/shared/book/${id}`}
          onSave={embedContent}
          contentId={id || ""}
          contentType="book"
          initialIsPublic={courseData?.is_shared || false}
        />
      </Modal>

      <AlertDialog
        isOpen={showLeaveConfirmation}
        onClose={handleCancelLeave}
        title="Unsaved Changes"
        description="You have unsaved changes. Would you like to save before leaving?"
        onConfirm={handleConfirmLeave}
        confirmText="Save & Leave"
        cancelText="Stay"
        showImage={false}
      />

      <AlertDialog
        isOpen={showEditConfirmation}
        onClose={handleCancelEdit}
        title="Edit Image"
        description="Would you like to edit this image using the Image Editor?"
        onConfirm={handleConfirmEdit}
        confirmText="Edit Image"
        cancelText="Cancel"
        showImage={true}
        imageUrl={pendingImageUrl || ""}
      />

      <AlertDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        title="Delete Chapter"
        description={`Are you sure you want to delete ${
          chapterToDelete !== -1 && chapters[chapterToDelete]
            ? parseChapterTitle(chapters[chapterToDelete])
            : "this chapter"
        }? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete Chapter"
        cancelText="Cancel"
        showImage={false}
        confirmStyle="outline"
      />
    </React.Fragment>
  );

  // Helper function to extract title for the confirmation dialog
  function parseChapterTitle(html: string): string {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Check if this is a cover chapter
      const isCover =
        html.includes('data-cover="true"') ||
        html.includes("book-cover-image") ||
        // Check for a simple image-only chapter (likely a cover)
        (html.includes("<img") &&
          doc.body.children.length <= 2 &&
          doc.body.querySelector("img") !== null &&
          !doc.body.querySelector("h1"));

      if (isCover) return "Book Cover";

      // Get chapter title from h1
      const titleElement = doc.querySelector("h1");
      return titleElement?.textContent || "this chapter";
    } catch (e) {
      return "this chapter";
    }
  }
};

export default EditBookCreator;
