import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface ErrorOverlayProps {
  isVisible: boolean;
  message: string | null;
  onClose: () => void;
}

const ErrorOverlay: React.FC<ErrorOverlayProps> = ({ isVisible, message, onClose }) => {
  if (!isVisible || !message) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-50">
      <div className="max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-red-200">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-center text-slate-900 mb-3">
          Unable to Load Image
        </h3>
        <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed">
          {message}
        </p>
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorOverlay;