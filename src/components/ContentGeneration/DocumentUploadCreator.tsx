import { useState } from "react";
import { FileText, Loader2, X, Upload, ArrowRight, Video, BookOpen, Sparkles, Target, ArrowLeft } from "lucide-react";
import apiService from "../../utilities/service/api";
import { useNavigate } from "react-router";
import { renderTopStepsTimeline } from "./ContentTimelineStepper";
import toast from "react-hot-toast";
import SummaryStep from "../../pages/onboarding/steps/SummaryStep";
import ContentGenerationViewer from "./ContentGenerationViewer";

const DocumentUploadCreator = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();


  const steps = [
    {
      id: "purpose",
      name: "Type of Content ",
      description: "Define what type of content you want to create",
    },
    {
      id: "upload",
      name: "Upload your Document ",
      description:
        "Upload the content of which you want to make the course or book",
    },
    {
      id: "summary",
      name: "Review Summary",
      description: "Review and edit the generated summary",
    },
    {
      id: "finalize",
      name: "Finalize Content",
      description: "Read your content by chapters and save",
    },
  ];

  

  const handleStepChange = (step:any) => {
    setCurrentStep(step);
  }

  const renderStep = () => {
    switch (currentStep) {
     case 0:
      return <ContentTypeCard  setCurrentStep={handleStepChange} />
    case 1:
      return <UploadDocumentCard setCurrentStep={handleStepChange} />
    case 2:
      return <SummaryPreviewStep  setCurrentStep={handleStepChange} />
    case 3:
      return <ContentGenerationStep  setCurrentStep={handleStepChange} />
     default: 
      return null
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
       

        {/* Help Section */}
        {/* <div className="text-center bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">💡</span>
            <h3 className="text-xl font-semibold text-gray-800">Need Help?</h3>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI will analyze your document and automatically structure it based on your selected content type. 
            You can always review and edit the results before finalizing.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default DocumentUploadCreator;




export const ContentTypeCard = ({setCurrentStep}:any) => {
  const [isSelected, setIsSelected] = useState("course");
  const navigate = useNavigate();
  const changingStep = (step:any) => {
    localStorage.setItem("contentType",step);
    setCurrentStep(step);

  }
  const contentTypes = [
    {
      id: "course",
      title: "Course",
      description: "Upload an existing document and we'll transform it into a comprehensive course",
      icon: Video,
      benefits: [
        "Interactive learning modules",
        "Step-by-step progression",
        "Engaging video content",
        "Quizzes and assessments"
      ],
      gradient: "from-blue-500 to-purple-600"
    },
    {
      id: "book",
      title: "Book",
      description: "Upload an existing document and we'll transform it into a well-structured book",
      icon: BookOpen,
      benefits: [
        "Professionally formatted chapters",
        "Rich visual storytelling",
        "Easy navigation",
        "Publication ready"
      ],
      gradient: "from-purple-500 to-pink-600"
    }
  ];
  return (
    <>
       {/* Content Type Selection */}
       <div className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Content Type</h2>
            
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {contentTypes && contentTypes.map((type:any) => {
                const IconComponent = type.icon;
                const isActive = isSelected === type.id;
                
                return (
                  <div
                    key={type.id}
                    onClick={() => setIsSelected(type.id)}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 group hover:shadow-xl ${
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
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? `bg-gradient-to-br ${type.gradient} text-white shadow-lg` 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-2xl font-bold transition-colors ${
                            isActive ? 'text-gray-800' : 'text-gray-700'
                          }`}>
                            {type.title}
                          </h3>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed">
                        {type.description}
                      </p>

                      {/* Benefits */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800">What you'll get:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {type.benefits.map((benefit:any, index:any) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                isActive ? 'bg-blue-500' : 'bg-gray-400'
                              }`}></div>
                              <span className="text-sm text-gray-700">{benefit}</span>
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
                Click continue to upload your document and begin the transformation process.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => navigate("/create")}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  ← Back to creation options
                </button>
                
                <button
                  className="px-8 py-4 bg-gradient-to-tl text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                  onClick={() => {
                    // Store the selected content type in localStorage
                    localStorage.setItem("contentType", isSelected);
                    setCurrentStep(1);
                  }}
                >
                  Continue to Upload
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}

const UploadDocumentCard = ({setCurrentStep}:any) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle file upload via dropzone
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/msword"
    ];
    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    if (
      validTypes.includes(file.type) ||
      ["pdf", "docx", "doc", "txt"].includes(fileExtension || "")
    ) {
      setUploadedFile(file);
      setSubmitError(null);
    } else {
      setSubmitError("Please upload a PDF, Word document, or text file");
    }
  };

  // Process document upload
  const handleDocumentUpload = async () => {
    if (!uploadedFile) {
      setSubmitError("Please select a file to upload");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", uploadedFile);
      
      // Get content type from localStorage (set in ContentTypeCard)
      const contentType = localStorage.getItem("contentType") || "course";
      formData.append("contentType", contentType);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      // Upload document
      const response = await apiService.post(
        "/quick-content/get-summary-from-document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        // Store the summary data in localStorage for the next step
        localStorage.setItem("documentSummary", JSON.stringify(response.data));
        toast.success("Document uploaded successfully");
        // Handle successful upload
        setTimeout(() => {
          setCurrentStep(2); // Move to next step
        }, 1000);
      } else {
        throw new Error(response.message || "Failed to process document");
      }
    } catch (err) {
      console.error("Error uploading document:", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Failed to upload document. Please try again."
      );
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-3xl">📄</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Upload Your Document</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Upload your existing document and our AI will transform it into engaging content
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              PDF & Word Supported
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              AI Processing
            </span>
            <span className="flex items-center gap-1">
              <Target className="w-4 h-4" />
              Instant Results
            </span>
          </div>
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
      
      {/* Upload Section */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Upload Your Document</h2>
          
          <div className="max-w-2xl mx-auto">
            {/* Drop Zone */}
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group ${
                isDragging 
                  ? 'border-blue-400 bg-blue-50 scale-105' 
                  : uploadedFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('document-upload')?.click()}
            >
              {uploadedFile ? (
                /* File Preview */
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-2xl flex items-center justify-center">
                    <FileText className="w-10 h-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{uploadedFile.name}</h3>
                    <p className="text-sm text-gray-600">{formatFileSize(uploadedFile.size)}</p>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">File Ready</span>
                    </div>
                    <button 
                      className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setUploadProgress(0);
                      }}
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload Prompt */
                <div className="space-y-4">
                  <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isDragging 
                      ? 'bg-blue-100 scale-110' 
                      : 'bg-gray-100 group-hover:bg-blue-100 group-hover:scale-105'
                  }`}>
                    <Upload className={`w-10 h-10 transition-colors ${
                      isDragging ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {isDragging ? 'Drop your document here' : 'Drag and drop your document'}
                    </h3>
                    <p className="text-gray-600 mb-4">or click to browse your files</p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded-full">PDF</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full">DOCX</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full">DOC</span>
                      <span className="px-2 py-1 bg-gray-100 rounded-full">TXT</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Hidden file input */}
              <input
                type="file"
                id="document-upload"
                className="hidden"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="mt-6 space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing document...</span>
                  <span className="text-gray-600 font-medium">{uploadProgress}%</span>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="mt-8">
              <button
                onClick={handleDocumentUpload}
                disabled={!uploadedFile || isSubmitting}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                  !uploadedFile || isSubmitting
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-tl text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Document...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Transform Document
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Content Type
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors hidden"
            >
              Cancel & Return to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      {/* <div className="text-center bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-2xl">💡</span>
          <h3 className="text-xl font-semibold text-gray-800">Tips for Best Results</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📝 Text Quality</h4>
            <p className="text-sm text-gray-600">Use documents with clear, well-structured text for best AI processing</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">📏 File Size</h4>
            <p className="text-sm text-gray-600">Optimal file size is under 10MB for faster processing</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🎯 Content Type</h4>
            <p className="text-sm text-gray-600">Educational or instructional content works best for course creation</p>
          </div>
        </div>
      </div> */}
    </>
  )
}

const SummaryPreviewStep = ({setCurrentStep}:any) => {
  const summary = JSON.parse(localStorage.getItem("documentSummary") || "{}")?.summary || "";
  return (
    <>
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Summary Preview</h2>
      <div className="max-w-4xl mx-auto my-10">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <SummaryStep summary={summary} onUpdate={setCurrentStep} />
        </div>
      </div>
    </div>
    <div className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Upload Document
            </button>
            
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 bg-gradient-to-tl text-white shadow-lg hover:shadow-xl transform hover:scale-105 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              Content Generation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
  
    </>
  )
}

const ContentGenerationStep = ({setCurrentStep}:any) => {
  const documentSummary = JSON.parse(localStorage.getItem("documentSummary") || "{}");
    return (
    <>
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Content Generation</h2>
      <div className="max-w-6xl mx-auto my-10">
        <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
          <ContentGenerationViewer title={documentSummary.originalFileName} summary={documentSummary.summary} chapterTitles={documentSummary.chapterTitles} contentType={documentSummary.contentType} contentCategory={documentSummary.contentType} contentDetails={{}} onBack={() => setCurrentStep(2)} />
        </div>
      </div>
    </div>
    
    </>
  )
}