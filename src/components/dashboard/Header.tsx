import type React from "react"
import { useState, useEffect } from "react"
import ChargebeePortalButton from '../shared/ChargebeePortalButton';
import { User, Menu, X, ChevronRight, LogOut, Calendar, Plus } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null)
  const navigate = useNavigate()

  const navigation = [
    { name: "AI Coach", to: "/dashboard/ai-tools" },
    { name: "Marketing Resources", to: "/dashboard/marketing-resources" },
    // { name: "Knowledgebase", to: "https://minilessonsacademy.com/members-area/knowledgebase/" },
    // { name: "Book a Call", to: "book-a-call", icon: <Calendar className="h-3.5 w-3.5 mr-1" /> },
    // { name: "Knowledgebase", to: "https://minilessonsacademy.com/members-area/knowledgebase/" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Load user data and profile picture
  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        setUserProfilePicture(user.profilePicture || null)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userId')
    localStorage.clear()
    
    toast.success('Logged out successfully!')
    
    // Redirect to login page
    navigate('/login')
  }

  return (
    <header
      className={`fixed w-full right-[-20px] me-5 z-50 transition-all duration-300 ${
        scrolled ? "py-2 bg-white/95 backdrop-blur-sm shadow-md " : "py-5 bg-white/90 backdrop-blur-sm shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="relative z-20 flex items-center">
          <img
            src="https://files.minilessonsacademy.com/mla_logo.png"
            alt="Mini Lessons Academy"
            className="h-8 sm:h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {navigation.slice(0, 3).map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
          
          {/* Create Button */}
          <Link
            to="/create"
            className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border-2 border-purple-600 text-purple-600 hover:text-purple-700 hover:border-purple-700 hover:bg-purple-50 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create
          </Link>
          
          {/* Book a Call Button (separate from regular nav items) */}
          <Link
            to="book-a-call"
            className="hidden items-center text-sm font-medium rounded-lg px-4 py-2 border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Book a Call
          </Link>
        </nav>

        {/* Profile Button */}
        {/* Profile and Logout Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Profile Picture and Link */}
          <Link
            to="/dashboard/profile"
            className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
          >
            {userProfilePicture ? (
              <img
                src={userProfilePicture}
                alt="Profile"
                className="w-8 h-8 rounded-full border-2 border-purple-200 hover:border-purple-400 transition-colors"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                <User className="w-4 h-4" />
              </div>
            )}
            <span className="font-medium text-sm text-gray-700">
              Profile
            </span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-red-50 text-gray-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Button with Profile Picture */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Mobile Profile Picture */}
          {userProfilePicture && (
            <img
              src={userProfilePicture}
              alt="Profile"
              className="w-8 h-8 rounded-full border-2 border-white/50"
            />
          )}
          
          {/* Menu Toggle Button */}
          <button
            className={`relative z-20 p-2 rounded-full transition-all duration-200 ${
              scrolled 
                ? "bg-purple-600 text-white hover:bg-purple-700" 
                : "bg-purple-600 backdrop-blur-sm text-white hover:bg-purple-700"
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 z-10 bg-white flex flex-col pt-16 px-6 h-[100vh] overflow-y-auto"
            >
              {/* Mobile Profile Header */}
              <div className="flex flex-col items-center pt-6 pb-8 border-b border-gray-200">
                {userProfilePicture ? (
                  <img
                    src={userProfilePicture}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-4 border-purple-200 mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-medium mb-3">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Welcome Back!</h3>
                <p className="text-sm text-gray-500">Manage your account and content</p>
              </div>

              <nav className="flex flex-col space-y-4 items-center mt-8 flex-1">
                {/* Navigation Links */}
                {navigation.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    className="w-full text-center py-4 px-6 text-gray-800 hover:text-purple-600 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 font-medium text-lg transition-all duration-200 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Create Button in Mobile */}
                <Link
                  to="/create"
                  className="w-full text-center py-4 px-6 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-300 font-semibold text-lg transition-all duration-200 rounded-lg flex items-center justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Content
                </Link>

                {/* Spacer */}
                <div className="flex-1 min-h-4"></div>

                {/* Action Buttons */}
                <div className="w-full flex space-x-3 pb-6">
                  <Link
                    to="/dashboard/profile"
                    className="flex-1 flex items-center justify-center text-white bg-gradient-to-r from-purple-600 to-indigo-600 font-medium rounded-xl px-4 py-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:from-purple-700 hover:to-indigo-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {userProfilePicture ? (
                      <img
                        src={userProfilePicture}
                        alt="Profile"
                        className="w-4 h-4 rounded-full mr-2"
                      />
                    ) : (
                      <User className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm">Profile</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex-1 flex items-center justify-center text-white bg-gradient-to-r from-red-500 to-red-600 font-medium rounded-xl px-4 py-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] hover:from-red-600 hover:to-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header;