import React, { useState, useCallback, useRef } from 'react';
import { Button } from '../../ui/button';
import { Book, ImageIcon, Edit2, CheckCircle, Upload, RefreshCw } from 'lucide-react';
import Modal from '../../ui/Modal';
import ImageGenerator from '../../ui/ImageGenerator';
import ImageEditor from '../../ui/ImageEditor/ImageEditor';
import toast from 'react-hot-toast';

interface GenerateCoverProps {
  onCoverImageGenerated?: (imageUrl: string) => void;
  courseId?: string | number
  contentType?: string 
  isMobile?: boolean
}

export const GenerateCover: React.FC<GenerateCoverProps> = ({ onCoverImageGenerated, courseId, contentType, isMobile }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'generate' | 'edit'>('generate');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the current image (either generated or uploaded)
  const currentImage = uploadedImage || generatedImage;

  // Use useCallback to ensure this function maintains reference stability
  const handleImageGenerated = useCallback((imageUrl: string) => {
    console.log("Image generated:", imageUrl); // Debug log
    setGeneratedImage(imageUrl);
    setUploadedImage(null);
    setIsGenerating(false);
    setShowImagePreview(true);
  }, []);

  const handleDirectUse = () => {
    if (currentImage && onCoverImageGenerated) {
      onCoverImageGenerated(currentImage);
    }
    handleClose();
  };

  const handleImageEdited = (editedImageUrl: string) => {
    if (onCoverImageGenerated) {
      onCoverImageGenerated(editedImageUrl);
    }
    handleClose();
  };

  const handleClose = () => {
    setShowModal(false);
    setCurrentStep('generate');
    setGeneratedImage(null);
    setUploadedImage(null);
    setIsGenerating(false);
    setShowImagePreview(false);
  };

  // Track when generation starts
  const handleGenerationStart = useCallback(() => {
    console.log("Generation started"); // Debug log
    setIsGenerating(true);
    setShowImagePreview(false);
  }, []);

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] as File;

    if(file?.size > 3000000) {
      toast.error("File size exceeds 3MB. Please upload a smaller file.");
      return;
    }

    if (file) {

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setGeneratedImage(null);
        setShowImagePreview(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle generating new image
  const handleGenerateNew = () => {
    setShowImagePreview(false);
    setGeneratedImage(null);
    setUploadedImage(null);
  };

  return (
    <>
    {!isMobile ? (
      <div className='text-purple-600'>
        <Button 
          variant="soft"
          size='sm'
          onClick={() => setShowModal(true)}
          className="bg-gray-100 hover:bg-gray-200 transition flex items-center gap-1"
          >
          <Book className="w-4 h-4 " />
          <span className="text-[12px] ">{contentType?.toLowerCase() === "course" ? "Course Cover" : "Book Cover" }</span>
        </Button>
      </div>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowModal(true)}
        className="p-0 flex items-center justify-center"
      >
        <Book className="w-5 h-5 text-primary" />
      </Button>
    )}

      {/* Hidden file input for upload */}
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        multiple={false}
        onChange={handleFileChange}
      />

      <Modal 
        isOpen={showModal}
        onClose={handleClose}
        title={currentStep === 'generate' ? (contentType?.toLowerCase() === "course" ? "Generate Course Cover" : "Generate Book Cover") : "Edit Book Cover"}
      >
        <div className="flex flex-col gap-4">
          {currentStep === 'generate' ? (
            <div className="space-y-4">
              <div className="flex justify-between md:items-center items-end md:flex-row flex-col gap-3">
                <p className="text-sm text-gray-600">
                  Generate a cover image for your book using AI or upload your own.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFileUpload}
                  className="justify-center text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 whitespace-nowrap disabled:pointer-events-none h-10 px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4" />
                  Upload Image
                </Button>
              </div>
              <div className="w-full justify-center gap-3 mt-4 pt-4 border-t md:hidden flex">
                <div className="flex gap-2 flex-row  justify-center items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep('edit')}
                    className="justify-center text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 whitespace-nowrap disabled:pointer-events-none h-10 px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"                    disabled={!currentImage || isGenerating}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDirectUse}
                    className="justify-center text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 whitespace-nowrap disabled:pointer-events-none h-10 px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"     disabled={!currentImage || isGenerating}
                  >
                    <CheckCircle className="w-4 h-4 mr-1 btn-primary" />
                    Use This Cover
                  </Button>
                </div>
              </div>
             

                <ImageGenerator 
                  onImageSelect={handleImageGenerated} 
                  onGenerateStart={handleGenerationStart}
                  isEditorContext={false}
                  uploadedImage={uploadedImage as any}
                  courseId={courseId}
                  contentType={contentType}
                />
              
              {/* Action buttons */}
              <div className="w-full justify-center gap-3 mt-4 pt-4 border-t md:flex hidden">
                <div className="flex gap-2 md:flex-row flex-col justify-center items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentStep('edit')}
                    className="justify-center text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 whitespace-nowrap disabled:pointer-events-none h-10 px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"                    disabled={!currentImage || isGenerating}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit Image
                  </Button>
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={handleDirectUse}
                    className="justify-center text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 whitespace-nowrap disabled:pointer-events-none h-10 px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 hover:bg-purple-700"                    disabled={!currentImage || isGenerating}
                  >
                    <CheckCircle className="w-4 h-4 mr-1 btn-primary" />
                    Use This Cover
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Fine-tune your book cover using the editor.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep('generate')}
                >
                  <ImageIcon className="w-4 h-4 mr-2 btn-outline-primary" />
                  Back to Generator
                </Button>
              </div>
              {currentImage && (
                <ImageEditor
                  initialImageUrl={currentImage}
                  onSave={handleImageEdited}
                />
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};