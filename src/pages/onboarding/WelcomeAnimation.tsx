"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { BookOpen, Sparkles, PenTool, BookText, Layers, Lightbulb } from "lucide-react"

interface WelcomeAnimationProps {
  onBegin: () => void
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onBegin }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50 px-4 sm:px-6">
      <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto text-center">
        {/* Floating papers animation - responsive sizing */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${6 + Math.random() * 10}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                opacity: 0.1 + Math.random() * 0.2,
              }}
            >
              <div
                className="w-8 h-10 sm:w-12 sm:h-16 md:w-16 md:h-20 bg-purple-200 rounded-sm"
                style={{
                  transform: `rotate(${Math.random() * 30 - 15}deg)`,
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Main content - with responsive adjustments */}
        <div className="relative z-10">
          <div className="mb-4 sm:mb-6 md:mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-600 blur-xl opacity-20"></div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 
                  bg-gradient-to-br from-purple-500 to-purple-800 rounded-full 
                  flex items-center justify-center">
                <Layers className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent 
              bg-gradient-to-r from-purple-600 to-purple-800 mb-2 sm:mb-3 md:mb-4">
            Welcome to Your Content Creation Journey
          </h1>

          <p className="text-gray-600 text-base sm:text-lg md:text-xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl 
              mx-auto mb-4 sm:mb-6 md:mb-8">
            Transform your ideas into beautifully crafted content with our AI-powered platform
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-6 sm:mb-8 md:mb-10">
            {/* Icon grid - responsive layout */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2 md:mb-3">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Ideate</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2 md:mb-3">
                <PenTool className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Create</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2 md:mb-3">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Customize</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-purple-100 flex items-center justify-center mb-2 md:mb-3">
                <BookText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm md:text-base text-gray-700 font-medium">Publish</span>
            </div>
          </div>

          {/* Responsive button */}
          <button
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 
              text-white px-6 sm:px-7 md:px-8 py-3 sm:py-4 md:py-5 lg:py-6 h-auto text-base sm:text-lg rounded-lg sm:rounded-xl 
              shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-w-[180px] font-medium"
            onClick={onBegin}
          >
            Let's Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeAnimation