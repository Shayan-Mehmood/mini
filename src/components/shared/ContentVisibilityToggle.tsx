import React, { useState, useEffect } from 'react';
import { Globe, Lock, Copy, Loader2, Check } from 'lucide-react';
import apiService from '../../utilities/service/api';
import toast from 'react-hot-toast';
import { getUserId } from '../../utilities/shared/userUtils';

interface ContentVisibilityToggleProps {
  contentId: string;
  contentType: 'book' | 'course';
  initialIsPublic?: boolean;
  onVisibilityChange?: (isPublic: boolean) => void;
  isCreator?: boolean;
  className?: string;
}

const ContentVisibilityToggle: React.FC<ContentVisibilityToggleProps> = ({
  contentId,
  contentType,
  initialIsPublic = false,
  onVisibilityChange,
  isCreator = true,
  className = ''
}) => {
  const [isPublic, setIsPublic] = useState<boolean>(initialIsPublic);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Get current sharing status when component mounts
  useEffect(() => {
    const fetchVisibilityStatus = async () => {
      try {
        const response = await apiService.get(`/shared/${contentType}/${contentId}`);
        if (response.success && response.data) {
          setIsPublic(response.data.isPublic || false);
          if (onVisibilityChange) onVisibilityChange(response.data.isPublic || false);
        }
      } catch (error) {
        console.error('Error fetching visibility status:', error);
        setIsPublic(initialIsPublic);
      }
    };
    
    fetchVisibilityStatus();
  }, [contentId, contentType, initialIsPublic, onVisibilityChange]);

  // Toggle visibility status
  const toggleVisibility = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const newStatus = !isPublic;
// Line 52

      const response = await apiService.put(`/shared/toggle-visibility/${contentId}/${contentType}`, {
        isPublic: newStatus,
        userId: getUserId() 
      });
      
      if (response.success) {
        setIsPublic(newStatus);
        if (onVisibilityChange) onVisibilityChange(newStatus);
        toast.success(`Content is now ${newStatus ? 'public' : 'private'}`);
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Failed to update visibility');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy shareable URL to clipboard
  const copyShareableUrl = () => {
    const shareUrl = `${window.location.origin}/shared/${contentType}/${contentId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setIsCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => toast.error('Failed to copy link'));
  };

  if (!isCreator) return null;

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2">
          {isPublic ? (
            <Globe className="h-4 w-4 text-green-500" />
          ) : (
            <Lock className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm font-medium">
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>
        
        {/* Minimal Toggle Switch */}
        <button 
          onClick={toggleVisibility}
          disabled={isLoading}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isPublic ? 'bg-green-500' : 'bg-gray-200'
          }`}
        >
          <span className="sr-only">{isPublic ? 'Public' : 'Private'}</span>
          {isLoading ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-3 w-3 animate-spin text-white" />
            </span>
          ) : (
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isPublic ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          )}
        </button>
      </div>
      
      {isPublic && (
        <div className="mt-2 flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-100">
          <input
            type="text"
            readOnly
            value={`${window.location.origin}/shared/${contentType}/${contentId}`}
            className="flex-1 text-xs bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            onClick={copyShareableUrl}
            className="p-1 rounded bg-white border border-gray-200"
            disabled={isCopied}
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 text-gray-500" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentVisibilityToggle;