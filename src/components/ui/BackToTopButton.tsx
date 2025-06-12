import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface BackToTopButtonProps {
  scrollThreshold?: number;
}

const BackToTopButton: React.FC<BackToTopButtonProps> = ({ 
  scrollThreshold = 300 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
      aria-label="Back to top"
      title="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
};

export default BackToTopButton;
