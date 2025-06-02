import { useState, useEffect } from "react";
import { Loader2, Zap, X, ArrowRight, Video, BookOpen, Sparkles, Target, FileText, PenLine, Book, Newspaper, GraduationCap } from "lucide-react";
import apiService from "../../utilities/service/api";
import { useNavigate } from "react-router";
import { renderTopStepsTimeline } from "./ContentTimelineStepper";
import SummaryStep from "../../pages/onboarding/steps/SummaryStep";
import ContentGenerationViewer from "./ContentGenerationViewer";

// Define localStorage keys in a central place for consistency
const LOCAL_STORAGE_KEYS = {
  CONTENT_TYPE: "quickContentType",
  PROMPT: "quickPrompt",
  SUMMARY: "quickSummary",
  TITLE: "quickTitle",
  CHAPTER_TITLES: "quickChapterTitles"
};

const QuickCourseCreator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Update steps to include the new Summary Review step
  const steps = [
    {
      id: "content_type",
      name: "Content Type",
      description: "Choose what type of content to create",
    },
    {
      id: "prompt",
      name: "Enter Prompt",
      description: "Describe what you want in your content",
    },
    {
      id: "summary",
      name: "Review Summary",
      description: "Review auto-generated summary",
    },
    {
      id: "finalize",
      name: "Generate Content",
      description: "Generate and review your content",
    }
  ];

  // Clean up localStorage when component unmounts or on navigation away
  useEffect(() => {
    return () => {
      // Only clean up if we're not completing the flow (handled in finalizeContent)
      if (currentStep < 3) {
        cleanupLocalStorage();
      }
    };
  }, []);

  const cleanupLocalStorage = () => {
    // Clean up all keys used in this flow
    Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    
    // Also clean up any keys used by ContentGenerationViewer
    localStorage.removeItem('content_generation_chapters');
    localStorage.removeItem('content_generation_current_index');
    localStorage.removeItem('content_generation_is_generating');
    localStorage.removeItem('content_generation_progress');
    localStorage.removeItem('content_generation_stopped');
    localStorage.removeItem('content_generation_completed_count');
    localStorage.removeItem('content_generation_id');
    localStorage.removeItem('content_generation_error');
    localStorage.removeItem('content_generation_current_generating_index');
    localStorage.removeItem('content_generation_props');
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  // Updated renderStep to include the new summary review step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ContentTypeCard setCurrentStep={handleStepChange} />;
      case 1:
        return <PromptInputCard setCurrentStep={handleStepChange} />;
      case 2:
        return <SummaryReviewCard setCurrentStep={handleStepChange} />;
      case 3:
        return <FinalizeContentCard setCurrentStep={handleStepChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 mx-auto relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-200 rounded-full blur-lg"></div>
        <div className="absolute -top-16 -right-16 w-56 sm:w-72 h-56 sm:h-72 bg-purple-600 rounded-full opacity-10 sm:opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 left-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-indigo-500 rounded-full opacity-5 sm:opacity-10"></div>
      </div>

      <div className="flex flex-col relative z-10">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button
            className="p-2 rounded-full bg-white/80 hover:bg-white text-red-600 hover:text-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={() => navigate("/dashboard")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="mb-8 px-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex justify-center">
            {renderTopStepsTimeline(steps, currentStep)}
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default QuickCourseCreator;

// First step: Content Type selection
const ContentTypeCard = ({ setCurrentStep }: { setCurrentStep: (step: number) => void }) => {
  const [isSelected, setIsSelected] = useState("course");
  const navigate = useNavigate();
  
  const changingStep = (step: number) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CONTENT_TYPE, isSelected);
    setCurrentStep(step);
  };

  const contentTypes = [
    {
      id: "course",
      title: "Course",
      description: "Create a structured course with lessons, examples, and practical exercises",
      icon: GraduationCap,
      benefits: [
        "Interactive learning modules",
        "Step-by-step progression",
        "Chapter-based organization",
        "Ready for publishing"
      ],
      gradient: "from-blue-500 to-purple-600"
    },
    {
      id: "book",
      title: "Book",
      description: "Author a comprehensive book with chapters, sections, and illustrations",
      icon: Book,
      benefits: [
        "Chapter-based organization",
        "In-depth content",
        "Formatted text and images",
        "Ready for publishing"
      ],
      gradient: "from-green-500 to-teal-600"
    },
  ];
  
  return (
    <>
      {/* Content Type Selection */}
      <div className="mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Content Type</h2>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-4">
            {contentTypes.map((type) => {
              const IconComponent = type.icon;
              const isActive = isSelected === type.id;
              
              return (
                <div
                  key={type.id}
                  onClick={() => setIsSelected(type.id)}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group hover:shadow-xl ${
                    isActive 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                  }`}
                >
                  {/* Selection indicator */}
                  {isActive && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="space-y-4">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? `bg-gradient-to-br ${type.gradient} text-white shadow-lg` 
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold transition-colors ${
                          isActive ? 'text-gray-800' : 'text-gray-700'
                        }`}>
                          {type.title}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {type.description}
                    </p>

                    {/* Benefits */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800 text-sm">What you'll get:</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {type.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-blue-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="text-xs text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selection indicator bar */}
                    <div className={`h-1 w-full rounded-full transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-r ${type.gradient}` 
                        : 'bg-gray-200'
                    }`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Next Steps Section */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-6">
              You've selected to create a <span className="font-semibold text-blue-600">{isSelected}</span>. 
              Click continue to enter your prompt and begin the creation process.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                ← Back to dashboard
              </button>
              
              <button
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                onClick={() => changingStep(1)}
              >
                Continue to Enter Prompt
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Second step: Prompt input
const PromptInputCard = ({ setCurrentStep }: { setCurrentStep: (step: number) => void }) => {
  const [quickPrompt, setQuickPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Get content type from localStorage
  const contentType = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTENT_TYPE) || "course";

  const handleGenerateSummary = async () => {
    if (!quickPrompt) {
      setSubmitError("Please enter a description for your content");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Store prompt in localStorage for use in summary and final steps
      localStorage.setItem(LOCAL_STORAGE_KEYS.PROMPT, quickPrompt);
      
      // Call API to generate summary and chapter titles
      const response = await apiService.post("/onboard/generate-quick-summary", {
        prompt: quickPrompt,
        contentType: contentType
      });
      
      if (response.success) {
        // Store the summary in localStorage
        localStorage.setItem(LOCAL_STORAGE_KEYS.SUMMARY, response.data.summary || "");
        localStorage.setItem(LOCAL_STORAGE_KEYS.TITLE, response.data.title || "");
        
        // Store chapter titles if they exist
        if (response.data.chapters && Array.isArray(response.data.chapters)) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.CHAPTER_TITLES, JSON.stringify(response.data.chapters));
        } else {
          // If API doesn't return chapters, generate default chapter titles based on content
          const defaultChapters = [
            "Introduction",
            "Main Concepts",
            "Practical Application",
            "Advanced Topics",
            "Conclusion"
          ];
          localStorage.setItem(LOCAL_STORAGE_KEYS.CHAPTER_TITLES, JSON.stringify(defaultChapters));
        }
        
        // Move to summary step
        setCurrentStep(2);
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
      
      // For recovery: generate fallback content
      localStorage.setItem(LOCAL_STORAGE_KEYS.SUMMARY, "This is an automatically generated summary based on your prompt. It provides an overview of what your content will cover and the main topics that will be included.");
      localStorage.setItem(LOCAL_STORAGE_KEYS.TITLE, "Auto-generated title based on your prompt");
      
      // Default chapter titles
      const fallbackChapters = [
        "Introduction", 
        "Core Concepts", 
        "Examples and Applications", 
        "Advanced Topics", 
        "Conclusion"
      ];
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHAPTER_TITLES, JSON.stringify(fallbackChapters));
      
      // Still move forward to allow the user to continue
      setCurrentStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">✏️</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              Create Your {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Enter a detailed description of what you want to create, and our AI will generate complete content
          </p>
         
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5" />
              <p className="font-medium">{submitError}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Prompt Input Section */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Enter Your Prompt</h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label htmlFor="quick-prompt" className="block text-lg font-medium text-gray-700 mb-3">
                  What would you like to create?
                </label>
                <textarea
                  id="quick-prompt"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder={
                    contentType === "course" 
                      ? "e.g., A beginner's guide to digital marketing, focusing on social media strategies for small businesses."
                      : contentType === "book"
                      ? "e.g., A comprehensive guide to sustainable gardening with chapters on soil health, native plants, and water conservation."
                      : "e.g., An in-depth article about the benefits of mindfulness meditation for busy professionals."
                  }
                  className="w-full px-4 py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-48"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Be specific about the topic, target audience, key areas to cover, and what you want to achieve.
                </p>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  onClick={handleGenerateSummary}
                  disabled={!quickPrompt || isSubmitting}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                    !quickPrompt || isSubmitting
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating summary...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Generate Summary
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Content Type
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel & Return to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="text-center bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">💡</span>
          <h3 className="text-xl font-semibold text-gray-800">Tips for Writing Effective Prompts</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🎯 Be Specific</h4>
            <p className="text-sm text-gray-600">Include details about audience, difficulty level, and specific topics to cover</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🧩 Structure</h4>
            <p className="text-sm text-gray-600">Mention how you want content organized (modules, chapters, sections)</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📚 Examples</h4>
            <p className="text-sm text-gray-600">Request specific types of examples, case studies, or practical applications</p>
          </div>
        </div>
      </div>
    </>
  );
};

// Third step: Summary Review
const SummaryReviewCard = ({ setCurrentStep }: { setCurrentStep: (step: number) => void }) => {
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const navigate = useNavigate();
  
  // Get content info from localStorage
  const contentType = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTENT_TYPE) || "course";
  const prompt = localStorage.getItem(LOCAL_STORAGE_KEYS.PROMPT) || "";
  
  // Load the generated summary when component mounts
  useEffect(() => {
    const savedSummary = localStorage.getItem(LOCAL_STORAGE_KEYS.SUMMARY) || "";
    const savedTitle = localStorage.getItem(LOCAL_STORAGE_KEYS.TITLE) || "";
    setSummary(savedSummary);
    setTitle(savedTitle);
  }, []);
  
  const handleSummaryUpdate = (updatedSummary: string) => {
    setSummary(updatedSummary);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUMMARY, updatedSummary);
  };
  
  const handleContinue = () => {
    setCurrentStep(3);
  };

  return (
    <>
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">📝</span>
            <h1 className="text-3xl font-bold text-gray-800">
              Review Your Summary
            </h1>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Check and edit the summary for your {contentType}
          </p>
        </div>
      </div>
      
      {/* Summary Review Section */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Original prompt reminder */}
            <div className="mb-6 p-4 border border-gray-200 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Your prompt:</h3>
              <p className="text-sm text-gray-600 italic">{prompt}</p>
            </div>
            
          
                      
            {/* Summary using SummaryStep component */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="content-summary" className="block text-lg font-medium text-gray-700">
                  Summary
                </label>
              </div>
              
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <SummaryStep 
                  summary={summary} 
                  onUpdate={handleSummaryUpdate} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Prompt
            </button>
            
            <button
              onClick={handleContinue}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              Generate Content
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Fourth step: Finalize Content - Now using ContentGenerationViewer
const FinalizeContentCard = ({ setCurrentStep }: { setCurrentStep: (step: number) => void }) => {
  const navigate = useNavigate();
  
  // Get stored data
  const contentType = localStorage.getItem(LOCAL_STORAGE_KEYS.CONTENT_TYPE) || "course";
  const prompt = localStorage.getItem(LOCAL_STORAGE_KEYS.PROMPT) || "";
  const summary = localStorage.getItem(LOCAL_STORAGE_KEYS.SUMMARY) || "";
  const title = localStorage.getItem(LOCAL_STORAGE_KEYS.TITLE) || "Your Content";
  
  // Get chapter titles
  const [chapterTitles, setChapterTitles] = useState<string[]>([]);
  
  // Load chapter titles on mount
  useEffect(() => {
    try {
      const storedChapterTitles = localStorage.getItem(LOCAL_STORAGE_KEYS.CHAPTER_TITLES);
      if (storedChapterTitles) {
        const parsedTitles = JSON.parse(storedChapterTitles);
        setChapterTitles(Array.isArray(parsedTitles) ? parsedTitles : []);
      } else {
        // Generate default chapter titles if none exist
        const defaultTitles = ["Introduction", "Core Concepts", "Practical Applications", "Advanced Topics", "Conclusion"];
        setChapterTitles(defaultTitles);
        localStorage.setItem(LOCAL_STORAGE_KEYS.CHAPTER_TITLES, JSON.stringify(defaultTitles));
      }
    } catch (error) {
      console.error("Error loading chapter titles:", error);
      // Fallback chapter titles
      const fallbackTitles = ["Introduction", "Main Content", "Conclusion"];
      setChapterTitles(fallbackTitles);
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHAPTER_TITLES, JSON.stringify(fallbackTitles));
    }
  }, []);
  
  // Prepare content details needed for ContentGenerationViewer
  const contentDetails = {
    audience: "General",
    style: "Educational",
    length: "Medium",
    numOfChapters: chapterTitles.length.toString(),
  };
  
  // Handle back navigation
  const handleBack = () => {
    setCurrentStep(2);
  };
  
  // Clean up localStorage when user completes the flow
  const handleSaveSuccess = () => {
    // Clean up all storage keys when content is successfully saved
    setTimeout(() => {
      Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    }, 2000);
  };

  return (
    <div className="w-full">
      {chapterTitles.length > 0 ? (
        <ContentGenerationViewer
          title={title}
          summary={summary}
          chapterTitles={chapterTitles}
          contentType={contentType === "course" ? "educational_course" : "educational_book"}
          contentCategory={contentType}
          contentDetails={contentDetails}
          onBack={handleBack}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">Preparing your content...</h3>
          <p className="text-gray-600 text-center">
            We're getting everything ready for your content generation.
          </p>
        </div>
      )}
    </div>
  );
};