import React, { useState } from 'react';
import { Phone, Mail, X, MessageCircle } from 'lucide-react';
import { useLocation, useParams } from 'react-router';

const CallUsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const {pathname} = location;
  const isEditPage = pathname.includes('/edit');
  console.log(isEditPage,' ')
  const contactOptions = [
    {
      type: 'email',
      label: 'Send us an Email',
      icon: Mail,
      action: () => {
        window.location.href = 'mailto:support@minilessonsacademy.com?subject=Support Request&body=Hi Mini Lessons Academy team,%0A%0AI need help with:%0A%0A';
      },
      description: 'Get help via email'
    },
  ];

  const handleOptionClick = (option: typeof contactOptions[0]) => {
    option.action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contact Options Panel */}
      {isOpen && (
        <div className={`fixed bottom-20 right-4 md:bottom-24 md:right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-enter $`}>
          <div className="p-4 border-b border-gray-100 bg-gradient-to-tl">
            <div className="flex items-center justify-between">
              <h3 className="font-secondary font-semibold text-white text-lg">Contact Us</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors p-1"
                aria-label="Close contact options"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-white text-sm opacity-90 mt-1">How would you like to reach us?</p>
          </div>
          
          <div className="p-2">
            {contactOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => handleOptionClick(option)}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mr-3">
                    <IconComponent size={20} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-primary font-medium text-dark text-sm">{option.label}</div>
                    <div className="font-primary text-text text-xs">{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-text font-primary text-center">
              We typically respond within 24 hours
            </p>
          </div>
        </div>
      )}

      {/* Floating Call Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={` bottom-4 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-tl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group ${
          isOpen ? 'scale-95' : 'hover:scale-105'
        } ${isEditPage ? 'hidden' : 'fixed'}`}
        aria-label={isOpen ? 'Close contact options' : 'Open contact options'}
      >
        {isOpen ? (
          <X size={24} className="text-white transition-transform duration-200" />
        ) : (
          <MessageCircle size={24} className="text-white transition-transform duration-200 group-hover:scale-110" />
        )}
        
        {/* Pulse animation ring */}
        
      </button>

      {/* Tooltip for desktop */}
      {!isOpen && (
        <div className="fixed bottom-4 right-20 md:bottom-8 md:right-24 z-40 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-dark text-white text-sm font-primary px-3 py-2 rounded-lg shadow-lg">
            Need Help? Contact Us
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 rotate-45 w-2 h-2 bg-dark"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallUsButton; 