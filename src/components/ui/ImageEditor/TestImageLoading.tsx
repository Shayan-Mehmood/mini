import React from 'react';
import SimpleCanvasTest from './SimpleCanvasTest';

const TestImageLoading: React.FC = () => {
  const testImageUrl = 'https://files.minilessonsacademy.com/images/course/9421/1748021584560-cover_1748021584543.png';

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Image Loading Test</h1>
      
      <SimpleCanvasTest imageUrl={testImageUrl} />
    </div>
  );
};

export default TestImageLoading;