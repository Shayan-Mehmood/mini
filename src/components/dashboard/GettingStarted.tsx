"use client"

import { useEffect, useRef } from "react"
import Scene from "./Scene"
import { useNavigate, useLocation } from "react-router"
import { CircleFadingPlus } from "lucide-react"
 
interface GettingStartedProps {
  button?: boolean
  title?: string
  description?: string
  modelPath?: string
  onTutorialClick?: () => void
}

const GettingStarted: React.FC<GettingStartedProps> = ({
  button = false,
  title = "Welcome to Mini Lessons Academy!",
  description = "Build beautiful courses, automate your content, and turn your expertise into an ongoing learning experience.",
  modelPath = "/models/futuristic_flying_animated_robot_-_low_poly/scene.gltf",
  onTutorialClick,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const tourTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check if tutorial has been shown before
    const tutorialShown = localStorage.getItem('tutorial_shown')
    
    // Only schedule tutorial if we're on dashboard and it hasn't been shown before
    if (!tutorialShown && onTutorialClick && location.pathname === "/dashboard") {
      // Set a small delay to ensure the user has settled on the dashboard
      tourTimeoutRef.current = setTimeout(() => {
        // Double check we're still on the dashboard before starting tour
        if (location.pathname === "/dashboard") {
          onTutorialClick()
          // Mark tutorial as shown
          localStorage.setItem('tutorial_shown', 'true')
        }
      }, 800) // 800ms delay gives time for potential quick navigation away
    }

    // Cleanup function to cancel any pending tour
    return () => {
      if (tourTimeoutRef.current) {
        clearTimeout(tourTimeoutRef.current)
        tourTimeoutRef.current = null
      }
    }
  }, [onTutorialClick, location.pathname]) // Use location.pathname instead of the entire location object

  return (
    <section
      className="w-full rounded-xl overflow-hidden shadow-lg relative"
      style={{
        background: "linear-gradient(to bottom right, #7b1fa2, #e53935)",
      }}
    >
      <div className="flex flex-col lg:flex-row items-center">
        {/* Content side */}
        <div className="py-8 px-8 lg:w-1/2 z-10 mt-20">
          <div>
            <h2 className="mb-4 text-3xl md:text-4xl tracking-tight font-extrabold text-white">{title}</h2>
            <p className="mb-8 font-light text-white sm:text-lg leading-relaxed">{description}</p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
              {button && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    // Only trigger tutorial if we're on the dashboard
                    if (onTutorialClick && location.pathname === "/dashboard") {
                      onTutorialClick()
                    }
                  }}
                  className="group inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 focus:ring-4 focus:ring-white/20 transition-all"
                >
                  <svg
                    className="mr-2 -ml-1 w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  View Tutorial
                </a>
              )}
              {/* {button && (
                <button
                  id="add-new-item"
                  onClick={handleNavigate}
                  className=" flex px-5 space-x-4 py-3 text-base font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 focus:ring-4 focus:ring-white/20 transition-all"
                >
                  <CircleFadingPlus className="mr-2" />
                  Create
                </button>
              )} */}
            </div>
          </div>
        </div>

        {/* 3D Model side */}
        {/* <div onClick={handleContentCreation} id="add-new-item" className="h-60 lg:h-80 w-full lg:w-1/2 relative">
          <Scene modelPath={modelPath} />
        </div> */}
      </div>
    </section>
  )
}

export default GettingStarted