"use client"


import { BookOpen, GraduationCap, Lightbulb, BookText, Palette, BookMarked, Video, FileText, Globe, Presentation, BookCopy, MonitorPlay, Blocks, FileQuestion } from "lucide-react"
import { useState } from "react"

interface ContentTypeStepProps {
  selectedPurpose: string
  onSelect: (purposeId: string, categoryId: string) => void
}

const ContentTypeStep: React.FC<ContentTypeStepProps> = ({ selectedPurpose, onSelect }) => {
  const [hoveredPurpose, setHoveredPurpose] = useState<string | null>(null)

  const categories = [
    {
      id: "course",
      title: "Course",
      icon: <Presentation className="w-8 h-8 mb-1" />,
      color: "blue",
      purposes: [
        {
          id: "educational_course",
          title: "Educational Course",
          description: "Build comprehensive learning experiences with lessons, exercises, and assessments.",
          icon: <Presentation className="w-10 h-10" />,
        },
        {
          id: "training_course",
          title: "Skills Training",
          description: "Develop professional training courses focused on practical skill development with exercises.",
          icon: <MonitorPlay className="w-10 h-10" />,
        },
        {
          id: "quick_guide",
          title: "Quick Guide",
          description: "Create short-form content like tutorials, how-to guides, or quick reference materials.",
          icon: <FileQuestion className="w-10 h-10" />,
        },
      ]
    },
    {
      id: "book",
      title: "Book",
      icon: <BookOpen className="w-8 h-8 mb-1" />,
      color: "purple",
      purposes: [
        {
          id: "educational_book",
          title: "Educational Book",
          description: "Create textbooks, study guides, or educational resources for students and learners.",
          icon: <GraduationCap className="w-10 h-10" />,
        },
        {
          id: "fiction",
          title: "Fiction",
          description: "Write engaging stories, novels, or creative fiction in various genres.",
          icon: <BookOpen className="w-10 h-10" />,
        },
        {
          id: "nonfiction",
          title: "Non-Fiction",
          description: "Create informative content like biographies, histories, or explanatory texts.",
          icon: <BookText className="w-10 h-10" />,
        },
      ]
    }
  ]

  // Helper function for getting the appropriate colors based on category
  const getCategoryColors = (categoryId: string, isSelected: boolean, isHovered: boolean) => {
    const category = categories.find(c => c.id === categoryId);
    const colorName = category?.color || "purple";
    
    if (colorName === "blue") {
      return {
        headerColor: "text-blue-600",
        bgGradient: isSelected ? "from-blue-50 to-white" : "bg-white",
        ringColor: isSelected ? "ring-blue-500" : "",
        hoverBorder: "hover:border-blue-200",
        iconBg: isSelected ? "from-blue-600 to-blue-800" : "bg-blue-50",
        iconColor: isSelected ? "text-white" : "text-blue-600",
        titleColor: isSelected ? "text-blue-800" : "text-gray-800",
        decorationBg: "from-blue-100 to-transparent",
        indicator: isSelected ? "bg-blue-500" : "bg-gray-200 group-hover:bg-blue-200"
      };
    }
    
    return {
      headerColor: "text-purple-600",
      bgGradient: isSelected ? "from-purple-50 to-white" : "bg-white",
      ringColor: isSelected ? "ring-purple-500" : "",
      hoverBorder: "hover:border-purple-200",
      iconBg: isSelected ? "from-purple-500 to-purple-700" : "bg-purple-50",
      iconColor: isSelected ? "text-white" : "text-purple-500",
      titleColor: isSelected ? "text-purple-800" : "text-gray-800",
      decorationBg: "from-purple-100 to-transparent",
      indicator: isSelected ? "bg-purple-500" : "bg-gray-200 group-hover:bg-purple-200"
    };
  };

  return (
    <div className="space-y-8">
      {/* <h1 className="text-2xl font-bold text-gray-800 mb-6">Type of Content</h1> */}
      
      {categories?.map((category) => (
        <div key={category.id} className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <div className={category.color === "blue" ? "text-blue-600" : "text-purple-600"}>
              {category.icon}
            </div>
            <h2 className={`text-2xl font-bold ${category.color === "blue" ? "text-blue-800" : "text-purple-800"}`}>
              {category.title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {category.purposes.map((purpose) => {
              const isSelected = selectedPurpose === purpose.id;
              const isHovered = hoveredPurpose === purpose.id;
              const colors = getCategoryColors(category.id, isSelected, isHovered);

              return (
                <div
                  key={purpose.id}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group ${
                    isSelected
                      ? `ring-2 ${colors.ringColor} bg-gradient-to-br ${colors.bgGradient}`
                      : `border border-gray-200 ${colors.hoverBorder} bg-white hover:shadow-md`
                  }`}
                  onClick={() => onSelect(purpose.id, category.id)}
                  onMouseEnter={() => setHoveredPurpose(purpose.id)}
                  onMouseLeave={() => setHoveredPurpose(null)}
                >
                  {/* Background decoration */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${colors.decorationBg} opacity-0 -translate-y-16 translate-x-16 transition-all duration-500 ${
                      isSelected || isHovered ? "opacity-50 -translate-y-12 translate-x-12" : ""
                    }`}
                  ></div>

                  <div className="relative p-5 flex flex-col h-full">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                        isSelected
                          ? `bg-gradient-to-br ${colors.iconBg} ${colors.iconColor} shadow-md`
                          : `${colors.iconBg} ${colors.iconColor}`
                      }`}
                    >
                      {purpose.icon}
                    </div>

                    <h3 className={`text-lg font-semibold mb-2 transition-colors ${colors.titleColor}`}>
                      {purpose.title}
                    </h3>

                    <p className="text-gray-600 text-sm flex-grow">{purpose.description}</p>

                    <div className={`mt-3 h-1 w-14 rounded-full transition-all duration-300 ${colors.indicator}`}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ContentTypeStep