import { useState, useEffect } from 'react';
import apiService from '../utilities/service/api';
// import apiService from '../../../utilities/service/api';

interface FirstViewImageGenerationResult {
  isFirstView: boolean;
  isChecking: boolean;
  isGenerating: boolean;
  generatedImage: string | null;
  error: string | null;
  manuallyGenerateImage: () => Promise<void>;
  manuallyUpdateStatus: () => Promise<void>;
}

/**
 * Hook that checks if content is being viewed for the first time and generates an image if needed
 * @param contentId - The ID of the course or book
 * @param autoGenerate - Whether to automatically generate an image if it's the first view (default: true)
 * @returns Object containing status flags, generated image data, and control methods
 */
export function useFirstViewImageGeneration(
  contentId: string | undefined, 
  autoGenerate: boolean = true
): FirstViewImageGenerationResult {
  const [isFirstView, setIsFirstView] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if this is the first view of the content
  useEffect(() => {
    async function checkFirstViewStatus() {
      if (!contentId) {
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      setError(null);
      
      try {
        const response = await apiService.get(`/first-view-status/${contentId}`, {});
        
        if (response.success) {
          setIsFirstView(!response.data.isFirstViewed);
          
          // If this is the first view and autoGenerate is enabled, generate an image
          if (!response.data.isFirstViewed) {
            generateImage();
          }
        } else {
          setError(response.message || 'Failed to check first view status');
        }
      } catch (err: any) {
        setError(err.message || 'Error checking first view status');
      } finally {
        setIsChecking(false);
      }
    }

    checkFirstViewStatus();
  }, [contentId, autoGenerate]);

  // Function to generate an image for first view
  const generateImage = async () => {
    if (!contentId) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await apiService.post(`/generate-first-view-image/${contentId}`, {});
      
      if (response.success) {
        setGeneratedImage(response.data.imageUrl);
      } else {
        setError(response.message || 'Failed to generate image');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  // Manually trigger image generation
  const manuallyGenerateImage = async () => {
    await generateImage();
  };

  // Manually update first view status
  const manuallyUpdateStatus = async () => {
    if (!contentId) return;
    
    try {
      const response = await apiService.put(`/first-view-status/${contentId}`, {
        isFirstView: false
      });
      
      if (response.success) {
        setIsFirstView(false);
      } else {
        setError(response.message || 'Failed to update view status');
      }
    } catch (err: any) {
      setError(err.message || 'Error updating view status');
    }
  };

  return {
    isFirstView,
    isChecking,
    isGenerating,
    generatedImage,
    error,
    manuallyGenerateImage,
    manuallyUpdateStatus
  };
}