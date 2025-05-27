import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import RichTextEditor from "../../../components/RichTextEditor";
import apiService from "../../../utilities/service/api";
import ChapterGallery from "./ChapterGallery";
import {
  Book,
  ImageIcon,
  PackagePlus,
  ShieldCloseIcon,
  Save,
  ExternalLink,
  ImagesIcon,
  FileCode2Icon,
  Mail,
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
import { useNavigate } from "react-router";
import { Music } from "lucide-react";
import ChapterQuizDisplay from "../../../components/ChapterQuizDisplay";

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
import { QuizDisplay } from "../../../components/QuizDisplay";
import BackButton from "../../../components/ui/BackButton";
import ImageGallery from "../../../components/AiToolForms/BookCreator/ImageGallery";
import AdminModel from "../../../components/AdminModel";

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

const EditCoursePage = () => {
  const { id } = useParams<{ id: string }>();
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [convertingBlob, setConvertingBlob] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showCoverGenerator, setShowCoverGenerator] = useState(false); // Separate state for cover generator
  const [imageGallery, setImageGallery] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);
  const [operationInProgress, setOperationInProgress] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number>(-1);
  const [chapters, setChapters] = useState<string[]>([]);
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string>("");
  const [openEditor, setOpenEditor] = useState<boolean>(false);
  const [currentEditingImage, setCurrentEditingImage] = useState<string | null>(
    null
  );
  const [isGalleryVisible, setIsGalleryVisible] = useState(true);

  const quillRef = useRef<ReactQuill>(null);
  const [showEditConfirmation, setShowEditConfirmation] =
    useState<boolean>(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const [chapterToDelete, setChapterToDelete] = useState<number>(-1);
  const [OpenQuizModal, setOpenQuizModal] = useState<boolean>(false);
  const [OpenAdminModal, setOpenAdminModal] = useState<boolean>(false);
  const [currentQuizContent, setCurrentQuizContent] = useState<{
    editorContent: string;
    sharedContent: string;
  } | null>(null);
  const [regeneratingQuestionIndex, setRegeneratingQuestionIndex] =
    useState<number>(-1);
  const [showLeaveConfirmation, setShowLeaveConfirmation] =
    useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const navigate = useNavigate();
  const [importingQuiz, setImportingQuiz] = useState<boolean>(false);
  const [quizUrl, setQuizUrl] = useState<string>("");
  const [isRefreshingCourse, setIsRefreshingCourse] = useState(false);
  const [hasQuizBeenImported, setHasQuizBeenImported] = useState(false);
  const [chapterQuiz, setChapterQuiz] = useState("");
  const [quizMessage, setQuizMessage] = useState("");
  const [coverMode, setCoverMode] = useState(false);
  const [aiImage, setAiIMage] = useState<string | null>(null);
  // Add to your existing state variables

  // const toggleQuizModal = () => setOpenQuizModal(!OpenQuizModal);
  // const toggleAdminModel = () => setOpenAdminModel(!OpenAdminModal);


  const toggleQuizModal = () => {
  if (operationInProgress) {
    toast.error("Please wait for the current operation to complete");
    return;
  }
  setOpenQuizModal(!OpenQuizModal);
};

const toggleAdminModel = () => {
  if (operationInProgress) {
    toast.error("Please wait for the current operation to complete");
    return;
  }
  setOpenAdminModal(!OpenAdminModal);
};

const handleOpenCoverGenerator = () => {
  setShowCoverGenerator(true);
  setImageGallery(false);
};

  const handleOpenImageGenerator = () => {
    setShowImageGenerator(true);
    setImageGallery(false);
  };

  const handleCloseImageGenerator = () => {
    setShowImageGenerator(false);
    setImageGallery(true); // Return to gallery when closing editor image generator
  };

// Add this function to handle modal close and reset cover mode
const handleCloseCoverGenerator = () => {
  setShowCoverGenerator(false);
};

  const handleImageClick = (imageUrl: string) => {
    setPendingImageUrl(imageUrl);
    setShowEditConfirmation(true);
    setOpenEditor(false);
    setCurrentEditingImage(null);
  };


  // Add this helper function inside your component
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

  const toggleGallery = () => setIsGalleryVisible(!isGalleryVisible);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response: any = await apiService.get(
          `/course-creator/getCourseById/${id}/course`,
          {}
        );
        setCourseData(response.data);
      

        if (response.data?.content) {
          console.log('1');
          try {
          console.log('2');

            const parsed = JSON.parse(response.data.content);
          console.log('3', typeof(parsed));
            
            if (typeof parsed === "string") {
              const again = JSON.parse(parsed);
              console.log('again block', again)
              if(response?.data?.cover_location){
                console.log(response?.data?.cover_location)
                setChapters([{title:"Cover Image", content: `<img src="${response?.data?.cover_location}" />`}, ...again])
                // setSelectedChapter(chapters[0].content)
              }
              setChapters(again);
              if(typeof(again[0])==='string'){
                console.log('4 ',again[0]);
                // Remove shared quiz content from the chapters 
                if(again[0].includes('<h2>Exercises</h2>')){
                  const cleanedChapter = again[0].replace(/<h2>Exercises<\/h2>[\s\S]*$/, '');;
                  setSelectedChapter(cleanedChapter)
                }else{
                  setSelectedChapter(again[0])
                }
                
              }else{
                console.log('5 ', again[0]);
                console.log(again[0].content, ' <<<<<<<');
                setSelectedChapter(again[0]?.content)
              }
              console.log('6 ');
              setSelectedChapterIndex(0)
              // setSelectedChapterTitle(again[0].title)
            } else {
              console.log(parsed, ' My Parsed contents');
              setChapters(parsed);
              setSelectedChapter(parsed[0].content)
              setSelectedChapterIndex(0)
              setSelectedChapterTitle(parsed[0].title)
            }
          } catch (e) {
            console.error("Error parsing course content", e);
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
              // Update the course with the new content
              const updateResponse = await apiService.post(
                `/course-creator/updateCourse/${id}/course`,
                {
                  content: JSON.stringify(blobResponse.data.chapters),
                }
              );

              if (updateResponse.success) {
                setChapters(blobResponse.data.chapters);
              } else {
                throw new Error(
                  "Failed to update course with converted content"
                );
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
                // quizUrl: `https://minilessonsacademy.com${response.data.quiz_location}`,
                quizUrl: quizFinalUrl,
              }
            );

            if (quizResponse.success) {
              setHasQuizBeenImported(true);
              setIsRefreshingCourse(true);
              // Fetch course again to get updated content with quizzes
              const updatedResponse = await apiService.get(
                `/course-creator/getCourseById/${id}/course`,
                {}
              );
              if (updatedResponse.data?.content) {
                try {
                  const parsed = JSON.parse(updatedResponse.data.content);
                  if (typeof parsed === "string") {
                    const again = JSON.parse(parsed);
                    setChapters(again);
                    setSelectedChapter(again[0].content)
                    setSelectedChapterIndex(0)
                    setSelectedChapterTitle(again[0].title)
                    
                  } else {
                    setChapters(parsed);
                    setSelectedChapter(parsed[0].content)
                    setSelectedChapterIndex(0)
                    setSelectedChapterTitle(parsed[0].title)
                  }
                } catch (e) {
                  console.error("Error parsing updated course content", e);
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
        setError(err.message || "Error fetching course data");
      } finally {
        setLoading(false);
      }
    };

    if (id && !isRefreshingCourse) {
      fetchCourse();
    }
  }, [id, hasQuizBeenImported, isRefreshingCourse]);

  const handleAIImageSelect = (imageUrl: string) => {
    console.log("Editor image selected:", imageUrl);
    setAiIMage(imageUrl);
    setShowImageGenerator(false);
    setImageGallery(false);
  };

  const handleContentChange = (newContent: string) => {
    if (newContent !== selectedChapter) {
      setHasUnsavedChanges(true);
    }
    setSelectedChapter(newContent);
  };

  // const handleChapterSelect = (chapterContent: any, index: number) => {
  //   // handleSave(false)
  //   if (chapterContent.title && chapterContent.content) {
  //     console.log(chapterContent.quiz, "quiz coming here ====>");
  //     setSelectedChapterTitle(chapterContent.title);
  //     setSelectedChapter(chapterContent.content);
  //     if (chapterContent.quiz) {
  //       setChapterQuiz(chapterContent.quiz);
  //     } else {
  //       setChapterQuiz;
  //     }

  //     if (
  //       chapterContent?.quiz &&
  //       chapterContent?.quiz?.editorContent &&
  //       chapterContent.quiz.sharedContent
  //     ) {
  //       setCurrentQuizContent(chapterContent.quiz);
  //     }
  //     setSelectedChapterIndex(index);
  //     setQuizMessage(
  //       "This quiz is generated using legacy application, for new quizes you have to delete the old ones"
  //     );
  //   } else {
  //     const {
  //       isCover,
  //       content,
  //       title,
  //       quizContent,
  //       index: selectedIndex,
  //     } = processChapterSelection(chapterContent, index);

  //     console.log(quizContent);
  //     setSelectedChapterTitle(title);
  //     setSelectedChapter(content);
  //     setSelectedChapterIndex(selectedIndex);
  //     setCurrentQuizContent(quizContent);
  //   }
  //   // setCurrentQuizContent(quizContent);
  // };

const handleChapterSelect = async (chapterContent: any, index: number) => {
  // If we're already loading a chapter, prevent selection
  if (currentOperation === "loading_chapter") return;

  // Auto-save current chapter if there are unsaved changes
  if (hasUnsavedChanges && selectedChapterIndex !== -1) {
    await performOperation(
      "saving_chapter",
      async () => handleSave(false),
      { 
        showToast: false, 
        successMessage: "Changes saved before switching chapters",
        errorMessage: "Failed to save changes before switching" 
      }
    );
  }

  // Add this function to standardize chapter format
const standardizeChapterFormat = (chapter: any) => {
  // If chapter is a string, convert to object
  if (typeof chapter === 'string') {
    const isCover = isCoverChapter(chapter);
    return {
      title: isCover ? "Cover Image" : "Untitled Chapter",
      content: chapter
    };
  }
  // If chapter is already an object with content property, return as is
  else if (typeof chapter === 'object' && chapter !== null && chapter.content) {
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
        
        if (standardizedChapter.quiz.editorContent && standardizedChapter.quiz.sharedContent) {
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
      const isCover = typeof currentChapter === "string" 
        ? isCoverChapter(currentChapter)
        : currentChapter && typeof currentChapter === "object" && "content" in currentChapter
          ? isCoverChapter(currentChapter.content)
          : false;
      
      // Use special handling for cover chapters
      const updatedContent = isCover 
        ? {
            title: "Cover Image", // Preserve the cover title
            content: selectedChapter,
            ...(currentQuizContent && { quiz: currentQuizContent })
          }
        : handleContentUpdate(
            selectedChapter,
            selectedChapterTitle,
            Boolean(currentQuizContent),
            chapters[selectedChapterIndex],
            currentQuizContent
          ) as any;

      if (deleteQuiz) {
        updatedContent.quiz = null;
        setCurrentQuizContent(null);
        setChapterQuiz("");
      }

      console.log(updatedChapters, '  Updated chapters ');
      

      updatedChapters[selectedChapterIndex] = updatedContent;

      const response = await apiService.post(
        `/course-creator/updateCourse/${id}/course`,
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
      successMessage: deleteQuiz ? "Quiz removed and changes saved" : "Changes saved successfully",
      errorMessage: "Failed to save changes" 
    }
  );
};

  const handleEditedImageSave = (editedImageUrl: string): void => {
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
  setImageGallery(false)
  if(coverMode){
    setCoverMode(false)
  }
  return performOperation(
    "adding_cover",
    async () => {
      const coverContent = generateCoverContent(imageUrl);
      
      // Check if we already have a cover
      const existingCoverIndex = chapters.findIndex((chapter:any) => 
        typeof(chapter) === 'string' 
          ? isCoverChapter(chapter) 
          : chapter?.content && isCoverChapter(chapter.content)
      );
      
      const hadCover = existingCoverIndex !== -1;
      
      // Determine if we're currently on the cover
      const wasOnCover = selectedChapterIndex === existingCoverIndex && hadCover;
      
      // Remember which actual chapter content we're currently editing
      const currentChapterContent = selectedChapter;
      const currentTitle = selectedChapterTitle;
      
      // Remove any existing cover chapter
      let updatedChapters = [...chapters].filter(
        (chapter:any) => typeof(chapter)==='string' 
          ? !isCoverChapter(chapter) 
          : !isCoverChapter(chapter.content) 
      );
      
      // Find what "real" chapter index we're on (ignoring cover)
      const realChapterIndex = hadCover && selectedChapterIndex > existingCoverIndex 
        ? selectedChapterIndex - 1  // Adjust if we had a cover
        : selectedChapterIndex;     // Otherwise use current index
      
      // Insert the new cover as the first item
      updatedChapters.unshift({
        title: "Cover Image",
        content: coverContent
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
          if (typeof newChapter === 'object' && newChapter.content) {
            // Don't change content if we're staying on the same chapter
            // This preserves any unsaved edits the user was making
            if (newChapter.content !== currentChapterContent) {
              setSelectedChapter(newChapter.content);
            }
            setSelectedChapterTitle(newChapter.title || "");
          } else if (typeof newChapter === 'string') {
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
      errorMessage: "Failed to add course cover"
    }
  );
};


const handleRemoveCoverImage = async () => {
  return performOperation(
    "removing_cover",
    async () => {
      // Find the cover chapter index using the enhanced isCoverChapter function
      const coverIndex = chapters.findIndex((chapter:any) => {
        if (typeof chapter === 'object' && chapter.content) {
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
        `/course-creator/updateCourse/${id}/course`,
        {
          content: JSON.stringify(updatedChapters),
          cover_location: null // Explicitly clear cover_location
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
          if (typeof nextChapter === 'object' && nextChapter.content) {
            setSelectedChapter(nextChapter.content);
            setSelectedChapterTitle(nextChapter.title || "");
          } else {
            setSelectedChapter(typeof nextChapter === 'string' ? nextChapter : "");
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
        `/course-creator/getCourseById/${id}/course`,
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
      errorMessage: "Failed to remove course cover"
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
        `/course-creator/updateCourse/${id}/course`,
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


  const handleSaveQuiz = async (editorQuizHTML: string, sharedQuizHTML: string) => {
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
        `/course-creator/updateCourse/${id}/course`,
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
      errorMessage: "Failed to save quiz to chapter"
    }
  );
};

const handleDeleteQuiz = async () => {
  if (selectedChapterIndex === -1 || !currentQuizContent) {
    toast.error("No quiz available to delete");
    return;
  }

  await handleSave(true);
};
  const handleRegenerateQuestion = async (questionIndex: number) => {
    if (!selectedChapter || !currentQuizContent) {
      toast.error("No quiz content available");
      return;
    }

    setRegeneratingQuestionIndex(questionIndex);

    try {
      // Store the original quiz content as backup
      const originalQuizContent = { ...currentQuizContent };

      // Create a parser and parse the current chapter HTML
      const parser = new DOMParser();

      // CRITICAL: We need to extract CLEAN chapter content with no quiz data at all
      // This will be what we show in the editor and what we use as base for saving
      const doc = parser.parseFromString(selectedChapter, "text/html");

      // Remove any quiz sections that might already be in the editor
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

      // Get the clean chapter content without any quiz sections
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
          // Format the quiz HTML with the new question
          const formattedQuiz = await formatQuizHTML({
            ...response.data,
            existingQuiz: currentQuizContent,
            replaceQuestionIndex: questionIndex,
          });

          // IMPORTANT FIX: Ensure the editor content has the h2 heading
          let editorContent = formattedQuiz.editorQuizHTML;
          if (!editorContent.trim().startsWith("<h2>Exercises</h2>")) {
            editorContent = `<h2>Exercises</h2>${editorContent}`;
          }

          // Update the quiz content state to show in the separate display
          setCurrentQuizContent({
            editorContent: editorContent,
            sharedContent: formattedQuiz.sharedQuizHTML,
          });

          // IMPORTANT: Create the final chapter content with ONLY the clean content
          // in the visible editor part, and proper quiz content as metadata
          const updatedChapters = [...chapters];
          const finalChapterContent = formatQuizContent(
            editorContent, // Using our fixed editor content
            formattedQuiz.sharedQuizHTML, // This contains the interactive quiz
            selectedChapterTitle,
            cleanContent // This is the clean chapter content WITHOUT any quiz sections
          );

          updatedChapters[selectedChapterIndex] = finalChapterContent;

          const saveResponse = await apiService.post(
            `/course-creator/updateCourse/${id}/course`,
            {
              content: JSON.stringify(updatedChapters),
            }
          );

          if (saveResponse.success) {
            setChapters(updatedChapters);

            // CRITICAL: Update the editor to show only the clean content,
            // NOT the content with the quiz embedded
            setSelectedChapter(cleanContent);

            // toast.success('Question regenerated successfully');
          } else {
            // Revert to original quiz content on save failure
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

  // const handleDeleteQuiz = async () => {
  //   if (selectedChapterIndex === -1 || !currentQuizContent) {
  //     toast.error("No quiz available to delete");
  //     return;
  //   }

  //   setCurrentQuizContent(null);
  //   setChapterQuiz("");
  //   handleSave(true);
  // };

  const handleImageGeneration = () => {
    setImageGallery(false)
    setShowImageGenerator(true)
  }

  const handleCreateAudio = async () => {
    const response = await apiService.post(`/audio/generate/${id}/course`, {
      voice: "alloy", // optional, defaults to "echo"
    });

    if (response.success) {
      toast.success("Audio created successfully");
    } else {
      toast.error("Failed to create audio");
    }
  };

  useEffect(() => {
    // Confirmation handler for when user tries to navigate away
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Standard browser confirmation dialog
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
        setShowLeaveConfirmation(true);
        return ""; // This text is usually ignored by most browsers
      }
    };

    // Add listener for tab/window closing
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Hook into history changes
    const unblock = () => {
      // Show our custom dialog when navigating away
      if (hasUnsavedChanges) {
        setShowLeaveConfirmation(true);
        return false;
      }
      return true;
    };

    // Handle browser back button
    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        // Prevent the default navigation
        e.preventDefault();
        // Show our custom dialog
        setShowLeaveConfirmation(true);
        // Push current state back to keep us on this page
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    // Push state to enable catching the back button
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleConfirmLeave = async () => {
    // Save content before leaving
    await handleSave(false);
    setShowLeaveConfirmation(false);
    // Allow navigation to continue
    navigate("/dashboard");
  };

  const handleCancelLeave = () => {
    setShowLeaveConfirmation(false);
    // Stay on the page
  };

  const handleImportExternalQuiz = async () => {
    if (!quizUrl) {
      toast.error("Please enter a valid quiz URL");
      return;
    }

    setImportingQuiz(true);
    try {
      const response = await apiService.post(
        "/course-creator/convert-external-quiz",
        {
          quizUrl,
        }
      );

      if (response.success && response.data) {
        // Format the quiz HTML with the imported quiz data
        const formattedQuiz = await formatQuizHTML({
          quizTitle: response.data.quizTitle,
          quizType: response.data.quizType,
          questions: response.data.questions,
        });

        // Update the quiz content state
        setCurrentQuizContent({
          editorContent: formattedQuiz.editorQuizHTML,
          sharedContent: formattedQuiz.sharedQuizHTML,
        });

        // Update the chapter with the new quiz
        const updatedChapters = [...chapters];
        const finalChapterContent = formatQuizContent(
          formattedQuiz.editorQuizHTML,
          formattedQuiz.sharedQuizHTML,
          selectedChapterTitle,
          selectedChapter
        );

        updatedChapters[selectedChapterIndex] = finalChapterContent;

        const saveResponse = await apiService.post(
          `/course-creator/updateCourse/${id}/course`,
          {
            content: JSON.stringify(updatedChapters),
          }
        );

        if (saveResponse.success) {
          setChapters(updatedChapters);
          setQuizUrl("");
          toast.success("Quiz imported successfully");
        } else {
          toast.error("Failed to save imported quiz");
        }
      } else {
        toast.error(response.message || "Failed to import quiz");
      }
    } catch (error) {
      console.error("Error importing quiz:", error);
      toast.error("Error importing quiz");
    } finally {
      setImportingQuiz(false);
    }
  };

  const handleSaveContent = async () => {
    await handleSave(false);
  };

  const handleChapterHeadingEdit = async (chapter:string,newTitle:string,index:number) =>{
    console.log(chapter,' << ');
    if (chapter.includes('<h1')) {
      chapter = chapter.replace(/<h1[^>]*>.*?<\/h1>/, `<h1>${newTitle}</h1>`);
      const updatedChapters = [...chapters];
      if(typeof(chapter) ==='string'){
        if(chapter.includes('<h2>Exercises</h2>')){
          const cleanedChapter = chapter.replace(/<h2>Exercises<\/h2>[\s\S]*$/, '');
          setSelectedChapter(cleanedChapter)
        }else{
          setSelectedChapter(chapter)
        }
      }else{
        setSelectedChapter(chapter)
      }

      
      const editedChapter = handleContentUpdate( chapter,
        newTitle,
        Boolean(currentQuizContent),
        chapters[selectedChapterIndex],
        currentQuizContent)

       
        updatedChapters[selectedChapterIndex] = editedChapter;

       
        const response = await apiService.post(
          `/course-creator/updateCourse/${id}/course`,
          {
            content: Array.isArray(updatedChapters)
              ? JSON.stringify(updatedChapters)
              : updatedChapters,
          }
        );
  
        if (response.success) {
          setChapters(updatedChapters);
          setHasUnsavedChanges(false); // Reset flag after successful save
          // toast.success('Changes saved successfully');
        } else {
          toast.error("Failed to save changes");
        }

      } else {
      console.log(chapter);
    }
  }

  const embedContent = () => {
    const iframeLink = `<iframe src="https://app.minilessonsacademy.com/shared/course/${id}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
    navigator.clipboard.writeText(iframeLink)
      .then(() => {
        toast.success(`HTML Copied for Course ID : ${id}`)
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  }

  const handleCoverImageSelect = (imageUrl: string) => {
    console.log("Cover image selected:", imageUrl);
    setShowCoverGenerator(false); // Close modal immediately
    
    // Directly call the cover image handler with the URL
    if (imageUrl) {
      handleAddCoverImage(imageUrl);
    }
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
            : "Loading course content..."}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {convertingBlob
            ? "Please wait while we process your course content"
            : "Please wait while we prepare your course editor"}
        </p>
        <div className="mt-6 w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary/80 rounded-full animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <React.Fragment>

{operationInProgress && (
  <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        <p className="text-lg">
          {currentOperation === "saving_content" ? "Saving changes..." :
           currentOperation === "saving_quiz" ? "Adding quiz..." :
           currentOperation === "loading_chapter" ? "Loading chapter..." :
           "Operation in progress..."}
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
            <BackButton  onBeforeNavigate={ () => {
            const confirmed = window.confirm("Are you sure you want to go back to the dashboard?");
            return true;
            }} label="Back" className="flex-shrink-0" href="/dashboard" />
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
          <BackButton  onBeforeNavigate={async () => {
    const confirmed = window.confirm("Are you sure you want to go back to the dashboard?");
    return true;
  }} label="Back to Dashboard" href="/dashboard" />
            <div className="flex flex-wrap justify-between gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              variant="soft"
              size="sm"
              className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
              onClick={()=>navigate(`/create-email-campaign/course/${id}`)}
            >
              <FileCode2Icon className="w-4 h-4" />
              <span className="text-xs whitespace-nowrap">Email Campaign</span>
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
    operationInProgress ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-200'
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
              onClick={() => navigate(`/create-audio/course/${id}`)}
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
              <span className="text-xs whitespace-nowrap">
                  Media Library
              </span>
            </Button>
<Button
  variant="soft"
  size="sm"
  className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
  onClick={handleOpenCoverGenerator} // Use the specific cover handler
>
  <Book className="w-4 h-4" />
  <span className="text-xs whitespace-nowrap">Course Cover</span>
</Button>

              {selectedChapterIndex !== -1 &&
  chapters[selectedChapterIndex] && (
    (typeof chapters[selectedChapterIndex] === "string" && 
     isCoverChapter(chapters[selectedChapterIndex])) ||
    (typeof chapters[selectedChapterIndex] === "object" && 
     "content" in chapters[selectedChapterIndex] && 
isCoverChapter(
                (chapters[selectedChapterIndex] as { content?: string }).content ?? ""
              ))
           )  && (
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
            {/* <Button
              variant="soft"
              size="sm"
              className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
              onClick={() => window.open(`/shared/course/${id}`, "_blank")}
              title="View live published version in new tab"
            >
              <ExternalLink className="w-4 h-4 text-primary" />
              <span className="text-xs whitespace-nowrap">share preview</span>
            </Button> */}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 px-4 py-2.5"
            onClick={() => handleSave(false)}
            title="Save your content changes"
          >
            <Save className="w-4 h-4 text-white" />
            <span className="text-xs font-medium whitespace-nowrap">
              Save Content
            </span>
          </Button>
          </div>
          
        </div>


        {/* Mobile toolbar with additional actions - appears below the editor */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white p-2 border-t border-purple-100 shadow-lg flex flex-wrap justify-around">
          <div className="flex flex-col items-center justify-center px-2 py-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={()=>navigate(`/create-email-campaign/course/${id}`)}
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
              onClick={() => navigate(`/create-audio/course/${id}`)}
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
          {/* Add this right after the Media button */}
<div className="flex flex-col items-center justify-center px-2 py-1.5">
  <Button
    variant="ghost"
    size="sm"
    onClick={handleOpenCoverGenerator} // Use the specific cover handler
    className="p-0 flex items-center justify-center"
  >
    <Book className="w-5 h-5 text-primary" />
  </Button>
  <span className="text-[10px] text-gray-600 mt-1">Cover</span>
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
/>
          </div>
          
          {/* Main editing area - responsive width based on gallery visibility */}
          <div
            className={`p-2 sm:p-4 md:p-6 bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out w-full 
              ${isGalleryVisible ? "md:flex-1" : "w-full"}`}
          >
            <div className="w-full h-full overflow-hidden flex flex-col">
              {/* Rich text editor */}
              <div className="flex-grow overflow-auto pb-20 md:pb-0">
                {selectedChapter ? (
                  <RichTextEditor
                    ref={quillRef}
                    initialContent={selectedChapter}
                    imageUrl={aiImage}
                    id={Number(id)}
                    onContentChange={handleContentChange}
                    onSave={() => handleSave(false)}
                    onImageClick={handleImageClick}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-[40vh] md:h-[50vh] text-center p-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 text-purple-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No Chapter Selected</h2>
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
                )}
              </div>

              {/* Quiz display area */}
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
        title="Image Editor"
        maxWidth="max-w-6xl"
      >
        <ImageEditor
          initialImageUrl={currentEditingImage || ""}
          onSave={handleEditedImageSave}
        />
      </Modal>

      {/* Editor Image Generator Modal */}
      <Modal
        isOpen={showImageGenerator}
        onClose={handleCloseImageGenerator}
        title="Image Generator"
      >
        <ImageGenerator
          onImageSelect={handleAIImageSelect}
          isEditorContext={true}
          NotCover={true}
          contentType={"course"}
          courseId={id}
          isCoverMode={false}
        />
      </Modal>

      {/* Cover Image Generator Modal - completely separate */}
      <Modal
        isOpen={showCoverGenerator}
        onClose={handleCloseCoverGenerator}
        title="Generate Course Cover"
      >
        <ImageGenerator
          onImageSelect={handleCoverImageSelect}
          isEditorContext={false}
          NotCover={true} // This ensures we don't show gallery tabs for cover
          contentType={"course"}
          courseId={id}
          isCoverMode={true}
          onAddAsCover={handleCoverImageSelect} // Direct pass-through to the same handler
        />
      </Modal>

      {/* Image Gallery Modal */}
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
          onCoverImageGenerated={handleCoverImageSelect}
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

      <Modal
        isOpen={OpenAdminModal}
        onClose={toggleAdminModel}
        title="Admin"
      >
        <AdminModel
          iframeLink= {`<iframe src="https://app.minilessonsacademy.com/shared/course/${id}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`}
          preview ={`/shared/course/${id}`}
          // selectedChapter={selectedChapter}
          onSave={embedContent}
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
             html.includes('data-cover="true"') || html.includes("book-cover-image") ||
                   // Check for a simple image-only chapter (likely a cover)
                   (html.includes('<img') && 
                    doc.body.children.length <= 2 && 
                    doc.body.querySelector('img') !== null &&
                    !doc.body.querySelector('h1'))

      if (isCover) return "Course Cover";

      // Get chapter title from h1
      const titleElement = doc.querySelector("h1");
      return titleElement?.textContent || "this chapter";
    } catch (e) {
      return "this chapter";
    }
  }
};

export default EditCoursePage;
