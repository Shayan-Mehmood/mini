import React from 'react';
import { Check, ChevronRight, Upload, Zap, BookType, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import BackButton from '../ui/BackButton';

export enum CreationMethod {
  NONE = "none",
  WIZARD = "wizard",
  UPLOAD = "upload",
  QUICK = "quick"
}

interface CreationOptionsProps {
  onMethodSelect: (method: CreationMethod) => void;
}

const CreationOptions: React.FC<CreationOptionsProps> = ({ onMethodSelect }) => {
  const navigate = useNavigate();

  return (
    <div className="px-4 min-h-screen py-12 sm:px-6 md:px-10 lg:px-12 max-w-6xl mx-auto">
      {/* Back to Dashboard Button */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 hidden">
        <BackButton 
          onBeforeNavigate={() => {
            // Optionally handle any pre-navigation logic here
            return true; // Allow navigation
          }}
          label="Back to Dashboard"
          iconSize={20}
          className="bg-purple-600 text-white"
          variant="outline"
          size="sm"
          href="/dashboard"
        />
      
      </div>
      
      <div className="mb-10 text-center pt-10">
        <div className=" hidden px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-3">
          Create Now!
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
          Create New Content
        </h2>
        <p className="text-base text-gray-600 max-w-2xl mx-auto">
          Choose how you'd like to begin creating your content. Each method offers different benefits.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card Template */}
        {[
          {
            title: "Guided Creation",
            subtitle: "Step-by-Step Wizard",
            description:
              "Create detailed, customized content with our guided assistant. Ideal for in-depth courses and books.",
            colorFrom: "from-purple-500",
            colorTo: "to-purple-700",
            icon: <BookType className="h-5 w-5" />,
            buttonText: "Start Guided Creation",
            buttonColor: "bg-purple-500 hover:bg-purple-600",
            features: [
              "Multiple customization options",
              "Fine-tune each chapter",
              "Best for detailed content",
            ],
            onClick: () => onMethodSelect(CreationMethod.WIZARD),
            buttonIcon: <ChevronRight className="w-4 h-4" />,
          },
          {
            title: "Document Upload",
            subtitle: "Use Existing Document",
            description:
              "Convert your existing document into an interactive course. Upload PDF or DOCX files.",
            colorFrom: "from-purple-500",
            colorTo: "to-purple-700",
            icon: <Upload className="h-5 w-5" />,
            buttonText: "Upload Document",
            buttonColor: "bg-purple-500 hover:bg-purple-600",
            features: [
              "Turn existing materials into courses",
              "Automatic content extraction",
              "Keep your original formatting",
            ],
            onClick: () => onMethodSelect(CreationMethod.UPLOAD),
            buttonIcon: <Upload className="w-4 h-4" />,
          },
          {
            title: "Quick Creator",
            subtitle: "One-Click Course",
            description:
              "Generate a complete course instantly with just a prompt. Perfect when you need content quickly.",
            colorFrom: "from-purple-500",
            colorTo: "to-purple-700",
            icon: <Zap className="h-5 w-5" />,
            buttonText: "Create Instantly",
            buttonColor: "bg-purple-500 hover:bg-purple-600",
            features: [
              "Fastest content creation option",
              "AI-generated structure and content",
              "Just provide a topic or title",
            ],
            onClick: () => onMethodSelect(CreationMethod.QUICK),
            buttonIcon: <Zap className="w-4 h-4" />,
          },
        ].map(
          (
            {
              title,
              subtitle,
              description,
              icon,
              colorFrom,
              colorTo,
              buttonText,
              buttonColor,
              features,
              onClick,
              buttonIcon,
            },
            index
          ) => (
            <div
              key={index}
              className={`bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1 hover:border-purple-200 flex flex-col animate-fade-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`bg-gradient-to-r ${colorFrom} ${colorTo} p-5 text-white rounded-t-xl flex justify-between items-center`}
              >
                <h3 className="font-semibold text-white text-lg">{title}</h3>
                <div className="bg-white/20 p-2 rounded-full">
                  {icon}
                </div>
              </div>

              <div className="p-6 flex flex-col justify-between flex-grow">
                <div className="mb-6 space-y-3">
                  <h4 className="text-xl font-medium text-gray-800">
                    {subtitle}
                  </h4>
                  <p className="text-gray-600">{description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center text-gray-600"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onClick}
                  className={`w-full ${buttonColor} text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]`}
                >
                  {buttonText}
                  {buttonIcon}
                </button>
              </div>
            </div>
          )
        )}
      </div>
          
      {/* Add a custom animation style */}
      <style >{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-up {
          animation: fadeUp 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default CreationOptions;