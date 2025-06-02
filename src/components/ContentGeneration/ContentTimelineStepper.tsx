import { Check } from "lucide-react";

  export const renderTopStepsTimeline = (steps:any,currentStep:any) => {
    return (
      <>
       <div className="scrollbar-hide hidden sm:flex flex-nowrap items-start justify-start overflow-x-auto gap-4">
          {steps.map((step:any, index:number) => (
            <div
              key={step.id}
              className="flex items-center flex-shrink-0 group"
            >
              <div className="flex-shrink-0">
                <div
                  className={`flex items-center justify-center w-8 h-8 text-xs rounded-full transition-all duration-300 ${
                    index < currentStep
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
                      : index === currentStep
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg ring-2 ring-purple-100"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
              </div>
              <div className="ml-2">
                <p
                  className={`text-xs font-medium transition-colors ${
                    index <= currentStep ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-[10px] text-gray-500 max-w-[100px] truncate">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="w-12 mx-2 hidden sm:block">
                  <div className="h-[2px] bg-gray-100 rounded-full">
                    <div
                      className={`h-[2px] rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-in-out ${
                        index < currentStep ? "w-full" : "w-0"
                      }`}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Mobile: Only show the active step, centered */}
        <div className="flex sm:hidden justify-center items-center">
          <div className="flex items-center flex-shrink-0 group">
            <div className="flex-shrink-0">
              <div
                className={`flex items-center justify-center w-8 h-8 text-xs rounded-full transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg ring-2 ring-purple-100`}
              >
                <span className="text-sm font-semibold">{currentStep + 1}</span>
              </div>
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-900">
                {steps[currentStep].name}
              </p>
              <p className="text-[10px] text-gray-500 max-w-[100px] truncate">
                {steps[currentStep].description}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }