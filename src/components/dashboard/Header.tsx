
import type React from "react"
import { useState, useEffect } from "react"
import { User, Menu, X, ChevronRight } from "lucide-react"
import { Link } from "react-router"
import { motion, AnimatePresence } from "framer-motion"

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const navigation = [
    { name: "AI Coach", to: "ai-tools" },
    // { name: "Marketing Resources", to: "https://minilessonsacademy.com/members-area/marketing-vip-resources-hub/" },
    { name: "Marketing Resources", to: "marketing-resources" },
    { name: "Knowledgebase", to: "knowledgebase" },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
        <nav className="hidden md:flex items-center space-x-8">
          {navigation.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              className={`text-gray-700  font-medium text-sm tracking-wide transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full  after:transition-all after:duration-300 ${scrolled ? "text-gray-700 hover:text-purple-600 after:bg-purple-600" : "text-white hover:text-slate-200 after:bg-slate-300"}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Profile Button */}
        <div className="hidden md:block">
          <Link
            to="https://minilessonsacademy.com/my-account/"
            className="flex items-center justify-center text-white bg-gradient-to-tl font-medium rounded-full px-6 py-2.5 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden relative z-20 p-2 rounded-full bg-gradient-to-tl text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0 z-10 bg-white flex flex-col pt-20 px-6 h-[100vh]"
            >
              <nav className="flex flex-col space-y-6 items-center mt-10">
                {navigation.map((link) => (
                  <Link
                    key={link.name}
                    to={link.to}
                    className="text-gray-800 hover:text-purple-600 font-medium text-xl transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="https://minilessonsacademy.com/my-account/"
                  className="flex items-center justify-center w-full text-white bg-gradient-to-tl font-medium rounded-full px-6 py-3 mt-6 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header;