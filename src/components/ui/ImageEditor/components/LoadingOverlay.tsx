import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl border border-slate-200">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Loading Image</h3>
        <p className="text-sm text-slate-600 text-center">Please wait while we prepare your image for editing...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;