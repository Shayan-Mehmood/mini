import type React from "react"
import { useState, useEffect } from "react"
import ChargebeePortalButton from '../shared/ChargebeePortalButton';
import { User, Menu, X, ChevronRight, LogOut, Calendar } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userProfilePicture, setUserProfilePicture] = useState<string | null>(null)
  const navigate = useNavigate()

  const navigation = [
    { name: "AI Coach", to: "ai-tools" },
    { name: "Marketing Resources", to: "marketing-resources" },
    { name: "Knowledgebase", to: "https://minilessonsacademy.com/members-area/knowledgebase/" },
    { name: "Book a Call", to: "book-a-call", icon: <Calendar className="h-3.5 w-3.5 mr-1" /> },
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
        scrolled ? "py-2 bg-white/95 backdrop-blur-sm shadow-md " : "py-5 bg-transparent text-white"
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
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.slice(0, 3).map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className={`text-gray-700 font-medium text-sm tracking-wide transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:transition-all after:duration-300 ${scrolled ? "text-gray-700 hover:text-purple-600 after:bg-purple-600" : "text-white hover:text-slate-200 after:bg-slate-300"}`}
            >
              {link.icon && link.icon}
              {link.name}
            </Link>
          ))}
          
          {/* Book a Call Button (separate from regular nav items) */}
          <Link
            to="book-a-call"
            className={`flex items-center text-sm font-medium rounded-full px-4 py-1.5 transition-all duration-200 ${
              scrolled 
                ? "text-purple-700 border border-purple-200 hover:bg-purple-50" 
                : "text-white border border-white/30 hover:bg-white/10"
            }`}
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
            <span className={`font-medium text-sm ${scrolled ? "text-gray-700" : "text-white"}`}>
              Profile
            </span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-red-50  ${
              scrolled ? "text-gray-700" : "text-white hover:bg-white/10"
            }`}
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
                    className="w-full text-center py-4 px-6 text-gray-800 hover:text-purple-600 hover:bg-purple-50 font-medium text-lg transition-all duration-200 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.icon && link.icon}
                    {link.name}
                  </Link>
                ))}

                {/* Spacer */}
                <div className="flex-1 min-h-4"></div>

                {/* Action Buttons */}
                <div className="w-full space-y-3 pb-6">
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center justify-center w-full text-white bg-gradient-to-tl  font-medium rounded-xl px-6 py-4 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {userProfilePicture ? (
                      <img
                        src={userProfilePicture}
                        alt="Profile"
                        className="w-5 h-5 rounded-full mr-3"
                      />
                    ) : (
                      <User className="h-5 w-5 mr-3" />
                    )}
                    View Profile
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center justify-center w-full text-white bg-gradient-to-r from-red-500 to-red-600 font-medium rounded-xl px-6 py-4 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
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