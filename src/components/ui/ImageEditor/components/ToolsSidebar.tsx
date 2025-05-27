import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Move, Pencil, Square, 
  Type, Crop, Sliders, ChevronDown, ChevronUp
} from 'lucide-react';
import { CATEGORIES, CategoryType } from '../types';

interface ToolsSidebarProps {
  activeCategory: CategoryType;
  setActiveCategory: (category: CategoryType) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toolComponent: React.ReactNode;
}

const ToolsSidebar: React.FC<ToolsSidebarProps> = ({
  activeCategory,
  setActiveCategory,
  sidebarCollapsed,
  setSidebarCollapsed,
  toolComponent
}) => {
  const [expandedCategory, setExpandedCategory] = useState<CategoryType | null>(null);

  const categories = [
    { icon: Move, category: CATEGORIES.SELECTION, label: "Selection", color: "blue" },
    { icon: Pencil, category: CATEGORIES.DRAWING, label: "Drawing", color: "green" },
    { icon: Square, category: CATEGORIES.SHAPES, label: "Shapes", color: "purple" },
    { icon: Type, category: CATEGORIES.TEXT, label: "Text", color: "orange" },
    { icon: Crop, category: CATEGORIES.TRANSFORM, label: "Transform", color: "red" },
    { icon: Sliders, category: CATEGORIES.FILTERS, label: "Filters", color: "indigo" }
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        active: 'bg-blue-50 text-blue-700',
        hover: 'hover:bg-blue-50',
        icon: 'text-blue-600'
      },
      green: {
        active: 'bg-green-50 text-green-700',
        hover: 'hover:bg-green-50',
        icon: 'text-green-600'
      },
      purple: {
        active: 'bg-purple-50 text-purple-700',
        hover: 'hover:bg-purple-50',
        icon: 'text-purple-600'
      },
      orange: {
        active: 'bg-orange-50 text-orange-700',
        hover: 'hover:bg-orange-50',
        icon: 'text-orange-600'
      },
      red: {
        active: 'bg-red-50 text-red-700',
        hover: 'hover:bg-red-50',
        icon: 'text-red-600'
      },
      indigo: {
        active: 'bg-indigo-50 text-indigo-700',
        hover: 'hover:bg-indigo-50',
        icon: 'text-indigo-600'
      }
    };
    
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const CategoryButton = ({
    icon: Icon,
    category,
    label,
    color
  }: {
    icon: React.ComponentType<any>;
    category: CategoryType;
    label: string;
    color: string;
  }) => {
    const isExpanded = expandedCategory === category;
    const isActive = activeCategory === category;
    const colorClasses = getColorClasses(color, isActive);
    
    return (
      <div className="w-full">
        <button
          onClick={() => {
            setActiveCategory(category);
            setExpandedCategory(isExpanded ? null : category);
          }}
          className={`
            group flex items-center justify-between w-full px-3 py-2.5
            text-left transition-colors duration-200
            rounded-lg font-medium text-sm
            ${isActive 
              ? colorClasses.active 
              : `text-gray-700 hover:bg-gray-50 ${colorClasses.hover}`
            }
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
          title={sidebarCollapsed ? label : undefined}
        >
          <div className="flex items-center min-w-0">
            <div className={`
              flex-shrink-0 transition-colors duration-200
              ${isActive ? colorClasses.icon : 'text-gray-500'}
              ${sidebarCollapsed ? '' : 'mr-3'}
            `}>
              <Icon size={18} strokeWidth={1.5} />
            </div>
            {!sidebarCollapsed && (
              <span className="truncate">
                {label}
              </span>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <div className="ml-2 flex-shrink-0">
              <ChevronDown 
                size={14} 
                className={`text-gray-400 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`} 
              />
            </div>
          )}
        </button>
        
        {/* Dropdown Container - No cropping, proper height */}
        {!sidebarCollapsed && isExpanded && isActive && (
          <div className="mt-1 mb-2">
            <div className={`
              mx-3 rounded-lg p-3
              ${colorClasses.active}
              transition-all duration-200 ease-out
            `}>
              {toolComponent}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`
      bg-white border-r border-gray-200
      transition-all duration-300 ease-in-out
      ${sidebarCollapsed ? 'w-14' : 'w-80'}
      flex flex-col h-full
    `}>
      {/* Header */}
      <div className="px-3 py-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        {!sidebarCollapsed && (
          <h3 className="font-semibold text-gray-800 text-base">
            Tools
          </h3>
        )}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="
            p-1.5 rounded-md hover:bg-gray-200 
            transition-colors duration-200
          "
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={16} className="text-gray-600" />
          ) : (
            <ChevronLeft size={16} className="text-gray-600" />
          )}
        </button>
      </div>
      
      {/* Categories Container - Proper scrolling without cropping */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {categories.map(({ icon, category, label, color }) => (
            <CategoryButton
              key={category}
              icon={icon}
              category={category}
              label={label}
              color={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsSidebar;