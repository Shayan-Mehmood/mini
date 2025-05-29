import React from 'react';
import CustomImageEditor from './CustomImageEditor';

interface ImageEditorProps {
  initialImageUrl: string;
  onSave: (editedImageUrl: string) => void;
  isCoverEdit?: boolean; // Add this prop to identify cover edits
}

const ImageEditor: React.FC<ImageEditorProps> = ({ 
  initialImageUrl,  
  onSave,
  isCoverEdit = false  // Default to false
}) => {
  if (!initialImageUrl) {
    return (
      <div className="mx-auto max-w-4xl p-5 text-center text-red-800 bg-red-100 border border-red-300 rounded-lg">
        Please provide an image URL to edit
      </div>
    );
  }

  return (
    <CustomImageEditor 
      initialImageUrl={initialImageUrl} 
      onSave={onSave} 
      isCoverEdit={isCoverEdit} 
    />
  );
};

export default ImageEditor;