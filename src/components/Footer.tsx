import React from 'react';
import { Link } from 'react-router';
import { Mail, MapPin, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const footerSections = {
    partners: {
      title: "Partners",
      links: [
        { name: "Signup", href: "/signup" },
        { name: "Login", href: "/login" },
      ]
    },
    company: {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Contact Us", href: "/contact" },
      ]
    },
    resources: {
      title: "Resources",
      links: [
        { name: "My Account", href: "/dashboard" },
        { name: "Suggestion Box", href: "/suggestions" },
        { name: "Refund Policy", href: "/refund-policy" },
        { name: "FAQ", href: "/faq" },
      ]
    },
    legal: {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms of Service", href: "/terms-of-service" },
        { name: "Income Disclaimer", href: "/income-disclaimer" },
      ]
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 py-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <img 
                src="https://files.minilessonsacademy.com/mla_logo.png" 
                height="40" 
                width="50" 
                alt="Mini Lessons Academy" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-gray-800">
                Mini Lessons Academy
              </span>
            </Link>
            <p className="text-gray-600 leading-relaxed mb-6 max-w-sm">
              Empowering educators and creators with AI-powered tools to build exceptional learning experiences and grow their online presence.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4 text-purple-600" />
                <span className="text-sm">support@minilessonsacademy.com</span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key} className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 relative">
                {section.title}
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-purple-600"></div>
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media and Bottom Bar */}
        <div className="border-t border-gray-200 py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Social Media */}
            <div className="flex items-center gap-6">
              <span className="text-gray-600 text-sm font-medium">Follow us:</span>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <Facebook className="h-4 w-4 text-gray-600 group-hover:text-purple-600" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <Twitter className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <Linkedin className="h-4 w-4 text-gray-600 group-hover:text-blue-600" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <Instagram className="h-4 w-4 text-gray-600 group-hover:text-purple-600" />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center lg:text-right">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} Mini Lessons Academy. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Made with ❤️ for educators worldwide
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      {/* <div className="h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600"></div> */}
    </footer>
  );
};

export default Footer;
