"use client";

import { useState, useEffect } from "react";
import {
  Check,
  ChevronRight,
  BookOpen,
  Sparkles,
  ChevronLeft,
  Layers,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import BookPurposeStep from "./steps/BookPurposeStep";
import BookDetailsStep from "./steps/BookDetailsStep";
import BookTitleStep from "./steps/BookTitleStep";
import SummaryStep from "./steps/SummaryStep";
import ChapterManagementStep from "./steps/ChapterManagementStep";
import apiService from "../../utilities/service/api";
import { useNavigate, useParams } from "react-router";

import ContentGenerationViewer from "../../components/ContentGeneration/ContentGenerationViewer";
import '../../index.css';
// Update ContentData type to include summary
export type ContentData = {
  purpose: string;
  category: string;
  details: Record<string, string>;
  title: string;
  summary: string;
  chapter_titles: [];
  numOfChapters: number;
};

// Rename the component to be more generic
const ContentGenerationStepper = () => {
  const navigate = useNavigate();
  const { contentType } = useParams<{ contentType?: string }>();

  const [currentStep, setCurrentStep] = useState(() => {
    return contentType ? 1 : 0;
  });

  const [contentData, setContentData] = useState<ContentData>(() => {
    const savedData = localStorage.getItem(`content_data_${contentType || ""}`);
    const defaultData = {
      purpose: contentType
        ? contentType.includes("book")
          ? "educational_book"
          : "educational_course"
        : "",
      category: contentType
        ? contentType.includes("book")
          ? "book"
          : "course"
        : "",
      details: {
        audience: "Beginners",
        style: "Academic",
        length: "Brief (800 or more words)",
        numOfChapters: "2",
      },
      title: "",
      summary: "",
      chapter_titles: [],
      numOfChapters: 3,
    };

    return savedData ? JSON.parse(savedData) : defaultData;
  });

  const [isCompleted, setIsCompleted] = useState(false);
  const [animateStep, setAnimateStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const [isSummaryGenerated, setIsSummaryGenerated] = useState(false);
  const [chaptersData, setChaptersData] = useState<any[]>([]);
  const [chapterFetchCount, setChapterFetchCount] = useState(0);

  const isBookContent = contentData?.category === "book";

  const steps = [
    {
      id: "purpose",
      name: "Type of Content ",
      description: "Define what type of content you want to create",
    },
    {
      id: "details",
      name: "Content Details",
      description: "Customize your content's style and structure",
    },
    {
      id: "title",
      name: "Title Inspiration Starts Here",
      description: "Give us an idea, and we'll suggest some great title options.",
    },
    {
      id: "summary",
      name: "Review Summary",
      description: "Review and edit the generated summary",
    },
    ...(isBookContent
      ? [
          {
            id: "chapters",
            name: "Organize Chapters",
            description: "Edit and arrange your book chapters",
          },
        ]
      : []),
    {
      id: "finalize",
      name: "Finalize Content",
      description: "Read your content by chapters and save",
    },
  ];

  useEffect(() => {
    if (contentType || contentData.category) {
      const storageKey = `content_data_${
        contentType || contentData.category || ""
      }`;
      localStorage.setItem(storageKey, JSON.stringify(contentData));
    }
    
  }, [contentData, contentType]);

  useEffect(() => {
    localStorage.removeItem('content_generation_chapters');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // scroll to top smoothly
    setAnimateStep(true);
    const timer = setTimeout(() => {
      setAnimateStep(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handlePurposeSelect = (purposeId: string, categoryId: string) => {
    setContentData((prev) => ({
      ...prev,
      purpose: purposeId,
      category: categoryId,
    }));
    
    scrollToBottom();

    localStorage.setItem(
      `content_data_${categoryId}`,
      JSON.stringify({
        ...contentData,
        purpose: purposeId,
        category: categoryId,
      })
    );

    navigate(`/create/${categoryId}`);
  };

  const handleDetailChange = (detailId: string, value: string) => {
    setContentData((prev) => ({
      ...prev,
      details: { ...prev.details, [detailId]: value },
    }));
  };

  const handleTitleSelect = (title: string) => {
    setContentData((prev) => ({ ...prev, title }));
  };

  const handleSummaryUpdate = (updatedSummary: string) => {
    setContentData((prev) => ({
      ...prev,
      summary: updatedSummary,
    }));
    localStorage.setItem("content_summary", updatedSummary);
  };

  const handleChapterTitlesUpdate = (updatedTitles: any) => {
    setContentData((prev) => ({
      ...prev,
      chapter_titles: updatedTitles,
    }));
    localStorage.setItem("book_chapter_titles", JSON.stringify(updatedTitles));
  };

  const generateSummary = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await apiService.post("/onboard/generate-summary", {
        contentType: contentData.purpose,
        contentCategory: contentData.category,
        contentTitle: contentData.title,
        contentDetails: contentData.details,
      });

      if (response.success) {
        setContentData((prev) => ({
          ...prev,
          summary: response.data.summary || "",
          chapter_titles: response.data.chapters || [],
        }));

        localStorage.setItem("content_summary", response.data.summary || "");
        setIsSummaryGenerated(true);
        setCurrentStep((prev) => prev + 1);

        if (response.data && response.data.id) {
          setContentId(response.data.id);
        }
      } else {
        throw new Error(response.message || "Failed to generate summary");
      }
    } catch (err) {
      console.error("Error generating summary:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to generate summary. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      setIsSubmitting(true);
      try {
        await generateSummary();
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 3) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 4 && isBookContent) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceedWithDetails = () => {
    // Object.keys(contentData.details).length >= 3;
    const essential = ["audience", "style", "length", "numOfChapters"];
    const enoughEssentials = essential.filter((item: any) => {
      if (contentData.details[item] !== undefined || null) {
        return contentData.details[item];
      }
    });
    if (enoughEssentials.length === 4) {
      return true;
    } else {
      return false;
    }
  };

  const canProceed = () => {
    if (currentStep === 0) {
      return contentData.purpose !== "";
    } else if (currentStep === 1) {
      return canProceedWithDetails();
    } else if (currentStep === 2) {
      return contentData.title !== "";
    } else if (currentStep === 3) {
      return contentData.summary !== "";
    } else if (currentStep === 4) {
      if (isBookContent) {
        return true;
      } else {
        return chaptersData.filter(Boolean).length > 0;
      }
    } else if (currentStep === 5 && isBookContent) {
      return chaptersData.filter(Boolean).length > 0;
    }
    return false;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BookPurposeStep
            selectedPurpose={contentData.purpose}
            onSelect={handlePurposeSelect as any}
          />
        );
      case 1:
        return (
          <BookDetailsStep
            selectedDetails={contentData.details}
            onChange={handleDetailChange}
          />
        );
      case 2:
        return (
          <BookTitleStep
            bookData={contentData}
            selectedTitle={contentData.title}
            onSelect={handleTitleSelect}
            isSubmitting={isSubmitting}
          />
        );
      case 3:
        return (
          <SummaryStep
            summary={contentData.summary}
            onUpdate={handleSummaryUpdate}
          />
        );
      case 4:
        if (isBookContent) {
          return (
            <ChapterManagementStep
              chapterTitles={contentData.chapter_titles as string[]}
              onUpdate={handleChapterTitlesUpdate}
            />
          );
        } else {
          return (
            <ContentGenerationViewer
              title={contentData.title}
              summary={contentData.summary}
              chapterTitles={contentData.chapter_titles as string[]}
              contentType={contentData.purpose}
              contentCategory={contentData.category}
              contentDetails={contentData.details}
              onBack={() => setCurrentStep(3)}
            />
          );
        }
      case 5:
        return (
          <ContentGenerationViewer
            title={contentData.title}
            summary={contentData.summary}
            chapterTitles={contentData.chapter_titles as string[]}
            contentType={contentData.purpose}
            contentCategory={contentData.category}
            contentDetails={contentData.details}
            onBack={() => setCurrentStep(isBookContent ? 4 : 3)}
          />
        );
      default:
        return null;
    }
  };

  if (isCompleted) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl shadow-[0_20px_60px_-15px_rgba(124,58,237,0.3)] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 text-white">
          <h2 className="text-3xl text-white font-bold">
            Your Creation Awaits!
          </h2>
          <p className="mt-2 opacity-90">We're bringing your vision to life</p>
        </div>

        <div className="bg-white p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-600 blur-lg opacity-30 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              "{contentData.title}"
            </h3>
            <p className="text-gray-600">
              Your {contentData.details.audience} {contentData.purpose} content
              is being crafted with care.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 mb-8">
            <h4 className="font-medium text-purple-800 mb-3">
              Content Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-sm">
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 text-gray-800 font-medium capitalize">
                  {contentData.purpose}
                </span>
              </div>
              {Object.entries(contentData.details).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="text-gray-500 capitalize">{key}:</span>
                  <span className="ml-2 text-gray-800 font-medium">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="bg-gradient-to-r flex items-center from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-10 py-4 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() =>
                (window.location.href = contentId
                  ? `/dashboard/content/${contentId}`
                  : "/dashboard")
              }
            >
              <FileText className="mr-2 h-5 w-5" />
              Go to My Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 mt-6 px-2">
        {/* Desktop/Tablet: Show all steps */}
        <div className="scrollbar-hide hidden sm:flex flex-nowrap items-start justify-start overflow-x-auto gap-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center flex-shrink-0 group"
            >
              <div className="flex-shrink-0">
                <div
                  className={`flex items-center justify-center w-8 h-8 text-xs rounded-full transition-all duration-300 ${
                    index < currentStep
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                      : index === currentStep
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg ring-2 ring-purple-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
              </div>
              <div className="ml-2">
                <p
                  className={`text-xs font-medium transition-colors ${
                    index <= currentStep ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-[10px] text-gray-500 max-w-[100px] truncate">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="w-12 mx-2 hidden sm:block">
                  <div className="h-[2px] bg-gray-100 rounded-full">
                    <div
                      className={`h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-in-out ${
                        index < currentStep ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Mobile: Only show the active step, centered */}
        <div className="flex sm:hidden justify-center items-center">
          <div className="flex items-center flex-shrink-0 group">
            <div className="flex-shrink-0">
              <div
                className={`flex items-center justify-center w-8 h-8 text-xs rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg ring-2 ring-purple-100`}
              >
                <span className="text-sm font-semibold">{currentStep + 1}</span>
              </div>
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-900">
                {steps[currentStep].name}
              </p>
              <p className="text-[10px] text-gray-500 max-w-[100px] truncate">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 mx-4">
          <p className="text-sm font-medium">{submitError}</p>
          <p className="text-sm mt-1">
            Please try again or contact support if the problem persists.
          </p>
        </div>
      )}

      <div
        className={`bg-white rounded-2xl shadow-[0_10px_50px_-12px_rgba(124,58,237,0.25)] overflow-hidden transition-all duration-300 ease-in-out ${
          animateStep
            ? "opacity-0 transform translate-y-4"
            : "opacity-100 transform translate-y-0"
        }`}
      >
        {currentStep < 4 ? (
          <>
            <div className="border-b border-gray-100">
              <div className="px-4 py-4 sm:px-6 sm:py-5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                  {steps[currentStep].name}
                </h2>
                <p className="text-sm sm:text-base text-gray-500">
                  {currentStep === 0 &&
                    "Select the purpose of your content to help us understand your goals."}
                  {currentStep === 1 &&
                    "Provide details about your content to customize its structure and style."}
                  {currentStep === 2 &&
                     `Choose a title for your ${isBookContent ? "book" : "course"} content.`}
                  {currentStep === 3 &&
                    "Review and edit the generated summary for your content."}
                  {currentStep === 4 &&
                    isBookContent &&
                    "Organize and edit your book chapters before content generation."}
                </p>
              </div>
            </div>

            <div className="p-6 ">{renderStep()}</div>
          </>
        ) : (
          <>{renderStep()}</>
        )}
      <div className="md:hidden flex justify-center py-3 z-50 ">
          <div className="text-sm font-medium text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </div>
      </div>
        <div className="md:relative fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 flex justify-between items-center gap-1 px-4 py-3 shadow-[0_-2px_10px_-2px_rgba(124,58,237,0.10)]">
          <button
            onClick={handleBack}
            disabled={
              currentStep === 0 ||
              currentStep === 4 ||
              currentStep === 5 ||
              isSubmitting
            }
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
              currentStep === 0 || currentStep === 4 || currentStep===5 || isSubmitting
                ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 hidden"
                : "hover:bg-purple-50 hover:text-purple-700 text-gray-600 bg-white border border-gray-200"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="md:px-4 md:py-1.5  bg-white rounded-full border border-gray-200 md:flex hidden">
            <div className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className={`md:px-5 px-2.5 py-2.5  rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200   ${
              canProceed() && !isSubmitting
                ? currentStep === 4  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-[0_4px_10px_-3px_rgba(124,58,237,0.5)] w-[200px]' : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-[0_4px_10px_-3px_rgba(124,58,237,0.5)]'
                : "bg-gray-100 text-gray-400 cursor-not-allowed "
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {currentStep === 2
                  ? "Generating Summary..."
                  : currentStep === 3
                  ? "Creating Content..."
                  : "Processing..."}
              </>
            ) : currentStep === 2 ? (
              <>
                Generate Summary
                <ChevronRight className="w-4 h-4" />
              </>
            ) : currentStep === 4 ? (
              <>
                Create My Content
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
        
      </div>

      
      <div className="absolute md:right-10 md:top-10 right-2 top-2 p-1 rounded-full bg-red-600 text-white cursor-pointer" onClick={()=>navigate('/dashboard')}>
          <X  />
      </div>
    </div>
  );
};

export default ContentGenerationStepper;
