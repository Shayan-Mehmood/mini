import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import asset1 from '../../../public/images/assets1.png';
import asset2 from '../../../public/images/assets2.webp';
import asset3 from '../../../public/images/assets3.png';
import asset4 from '../../../public/images/assets4.webp';
import asset5 from '../../../public/images/assets5.png';
import asset6 from '../../../public/images/assets6.webp';
import asset7 from '../../../public/images/assets7.png'
import asset8 from '../../../public/images/assets8.webp';

interface SpotlightItem {
  id: number;
  type: 'Course' | 'Book';
  title: string;
  creator: string;
  image: string;
  whatsInside: string[];
  whyWeLove: string[];
}

const CourseSpotlight: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: number]: boolean}>({});
  const flipContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth < 768;
  // Sample data with both courses and books
  const spotlightItems: SpotlightItem[] = [
    {
      id: 1,
      type: 'Course',
      title: 'Harmony of the Soul: Exploring Mindful Faith',
      creator: 'Serena Delgado',
      image: asset1,
      whatsInside: [
        'A gentle exploration of spiritual practices and faith-based mindfulness techniques',
        'Daily meditations, reflective journaling, and uplifting group discussions',
        'Practical ways to integrate spiritual calm into busy modern life'
      ],
      whyWeLove: [
        'Encourages a supportive community for spiritual growth',
        'Offers adaptable lessons for people of all backgrounds',
        'Focuses on balancing inner peace with real-world demands'
      ]
    },
    {
      id: 2,
      type: 'Book',
      title: 'The Enchanted Lighthouse',
      creator: 'Bella Dawes',
      image: asset2,
      whatsInside: [
        'A magical adventure where siblings discover a lighthouse that glows with enchanted light',
        'Whimsical sea creatures, secret tunnels, and hidden treasures',
        'Themes of family, bravery, and the power of imagination'
      ],
      whyWeLove: [
        'Sparks wonder and curiosity in young readers',
        'Teaches valuable lessons about teamwork and courage',
        'Filled with delightful characters and enchanting illustrations'
      ]
    },
    {
      id: 3,
      type: 'Course',
      title: 'Taste the World: Global Cuisine for Home Cooks',
      creator: 'Mia Romano',
      image: asset3,
      whatsInside: [
        'Step-by-step recipes from different cultures (Italian, Thai, Mexican, etc.)',
        'Tips on spices, flavor combinations, and cooking techniques',
        'Time-saving hacks and meal-planning strategies'
      ],
      whyWeLove: [
        'Makes international dishes accessible to everyone',
        'Introduces diverse flavors and cooking methods',
        'Perfect for busy families and culinary adventurers alike'
      ]
    },
    {
      id: 4,
      type: 'Book',
      title: 'Shadows in the Reflection',
      creator: 'Conrad Miller',
      image: asset4,
      whatsInside: [
        'A gripping story of a detective haunted by strange reflections in mirrors',
        'Twists and turns as hidden secrets from the past come to light',
        'Fast-paced action, psychological suspense, and unexpected betrayals'
      ],
      whyWeLove: [
        'Keeps you on the edge of your seat with every chapter',
        'Explores the blurred lines between reality and illusion',
        'Perfect for fans of suspenseful, atmospheric mysteries'
      ]
    },
    {
      id: 5,
      type: 'Course',
      title: 'How To Be A Social Media Wizard',
      creator: 'Travis Neal',
      image: asset5,
      whatsInside: [
        'Practical guides to building a strong brand presence on major social platforms',
        'Content creation tips, including video and storytelling hacks',
        'Growth strategies, analytics insights, and community engagement tactics'
      ],
      whyWeLove: [
        'Simplifies the world of social media marketing',
        'Provides actionable steps that even beginners can follow',
        'Encourages authentic engagement rather than just chasing numbers'
      ]
    },
    {
      id: 6,
      type: 'Book',
      title: 'Wish Upon the Wildflowers',
      creator: 'Eleanor Park',
      image: asset6,
      whatsInside: [
        'A heartfelt love story set in a quaint countryside town',
        'Two strangers brought together by a forgotten wildflower field',
        'Themes of second chances, hope, and the healing power of nature'
      ],
      whyWeLove: [
        'Delivers a comforting escape into a dreamy, pastoral setting',
        'Characters are relatable, with rich emotional depth',
        'Reminds us that love can bloom in the most unexpected places'
      ]
    },
    {
      id: 7,
      type: 'Course',
      title: 'From Sketch to Screen',
      creator: 'Jade Carter',
      image: asset7,
      whatsInside: [
        'Basics of digital illustration software and tablet drawing',
        'Fun exercises for character design, color theory, and layering',
        'Tips on turning sketches into polished, shareable artwork'
      ],
      whyWeLove: [
        'Encourages creativity in a stress-free, playful environment',
        'Perfect for both aspiring artists and hobbyists',
        'Builds confidence in digital art techniques step by step'
      ]
    }, 
    {
      id: 8,
      type: 'Book',
      title: 'Starsong Academy',
      creator: 'Zeke Williams',
      image: asset8,
      whatsInside: [
        'A futuristic boarding school for kids gifted in astronomy and space technology',
        'Rivalry, friendship, and cosmic challenges as they learn to pilot starships',
        'Themes of teamwork, self-discovery, and interplanetary exploration'
      ],
      whyWeLove: [
        'Combines a fun school setting with thrilling space adventures',
        'Encourages readers to dream big and explore the unknown',
        'Showcases the importance of cooperation and innovation'
      ]
    }
  ];

  // Preload images for better performance
  useEffect(() => {
    spotlightItems.forEach((item) => {
      const img = new Image();
      img.src = item.image;
    });
  }, []);

  // Set up auto-rotation if enabled
  useEffect(() => {
    let interval: number | undefined;
    if (isAutoPlaying) {
      interval = window.setInterval(() => {
        goToNext();
      }, 6000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoPlaying, currentIndex]);

  const handleSlideChange = (newIndex: number, direction: 'next' | 'prev') => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setFlipDirection(direction);
    setNextIndex(newIndex);
    
    // Complete the transition after animation
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setNextIndex(null);
      setIsFlipping(false);
    }, 800); // Match this with the CSS animation duration
  };

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    const newIndex = currentIndex === 0 ? spotlightItems.length - 1 : currentIndex - 1;
    handleSlideChange(newIndex, 'prev');
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    const newIndex = currentIndex === spotlightItems.length - 1 ? 0 : currentIndex + 1;
    handleSlideChange(newIndex, 'next');
  };

  const currentItem = spotlightItems[currentIndex];
  const nextItem = nextIndex !== null ? spotlightItems[nextIndex] : null;

  const handleImageLoad = (itemId: number) => {
    setImageLoadingStates(prev => ({ ...prev, [itemId]: false }));
  };

  const handleImageLoadStart = (itemId: number) => {
    setImageLoadingStates(prev => ({ ...prev, [itemId]: true }));
  };

  const renderContentCard = (item: SpotlightItem, isBack: boolean = false) => {
    const isLoading = imageLoadingStates[item.id];
    
    return (
      <div className="flex flex-col lg:flex-row h-full">
        {/* Image Section */}
        <div className="lg:w-1/2 relative lg:overflow-hidden h-[740px] lg:h-auto">
          {/* Loading skeleton */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400 text-lg">Loading...</div>
            </div>
          )}
          
          <img
            src={item.image}
            alt={item.title}
            className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoadStart={() => handleImageLoadStart(item.id)}
            onLoad={() => handleImageLoad(item.id)}
            onError={() => handleImageLoad(item.id)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>

        {/* Content Section */}
        <div className="lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center space-y-6 lg:space-y-8">
          {/* Content Type Badge */}
          <div className="inline-block">
            <span className="px-4 py-2 bg-gray-800 text-white text-sm font-semibold rounded-full">
              {item.type}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-2xl lg:text-4xl font-bold text-gray-800 leading-tight">
            {item.title}
          </h3>

          {/* Creator */}
          <div>
            <h4 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2">
              {item.type === 'Course' ? 'Creator' : 'Author'}
            </h4>
            <p className="text-gray-600 text-lg">{item.creator}</p>
          </div>

          {/* What's Inside */}
          <div>
            <h4 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
              What's inside the {item.type.toLowerCase()}
            </h4>
            <div className="space-y-3">
              {item.whatsInside.map((point, index) => (
                <p key={index} className="text-gray-700 leading-relaxed">
                  {point}
                </p>
              ))}
            </div>
          </div>

          {/* Why We Love */}
          <div>
            <h4 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
              Why we love this {item.type.toLowerCase()}
            </h4>
            <div className="space-y-3">
              {item.whyWeLove.map((point, index) => (
                <p key={index} className="text-gray-700 leading-relaxed">
                  {point}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-12 lg:py-20 bg-gradient-to-br from-orange-100 via-purple-100 to-pink-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-orange-200 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-200 rounded-full blur-lg"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-4">
            Content Spotlight
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600">
            This Months Spotlighted Content
          </p>
        </div>

        {/* Main Spotlight Container with Side Navigation */}
        <div className="relative flex items-center justify-center">
          {/* Left Navigation Arrow */}
          <button
            onClick={goToPrevious}
            className="hidden lg:flex absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-purple-600 p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
            aria-label="Previous content"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Content Container with 3D Flip Animation */}
          <div 
            className="w-full max-w-6xl mx-auto perspective-1000"
            style={{ perspective: '1000px' }}
          >
            <div 
              ref={flipContainerRef}
              className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden transition-all duration-800 h-full ${
                isFlipping ? (flipDirection === 'next' ? 'animate-flip-next' : 'animate-flip-prev') : ''
              }`}
              style={{ 
                transformStyle: 'preserve-3d',
                minHeight: isMobile ? '1200px' : '800px',
              }}
            >
              {/* Front face - Current item */}
              <div className={`absolute inset-0 backface-hidden ${isFlipping ? 'animate-fade-out' : ''}`}>
                {renderContentCard(currentItem)}
              </div>
              
              {/* Back face - Next item (only rendered during transition) */}
              {nextItem && isFlipping && (
                <div className="absolute inset-0 backface-hidden animate-fade-in" 
                     style={{ transform: 'rotateY(180deg)' }}>
                  {renderContentCard(nextItem, true)}
                </div>
              )}
            </div>
          </div>

          {/* Right Navigation Arrow */}
          <button
            onClick={goToNext}
            className="hidden lg:flex absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-purple-600 p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl"
            aria-label="Next content"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Mobile Navigation - Bottom arrows for smaller screens */}
        <div className="flex lg:hidden justify-center items-center mt-8 space-x-4">
          <button
            onClick={goToPrevious}
            className="bg-white/80 hover:bg-white text-purple-600 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous content"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="bg-white/80 hover:bg-white text-purple-600 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next content"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Section */}
        {/* <div className="text-center mt-12 lg:mt-16">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://minilessonsacademy.com/wp-content/uploads/2024/10/14-WInner.png"
              alt="Winner Badge"
              className="w-16 h-16 mr-4"
            />
            <p className="text-xl text-gray-700 font-medium">
              🏆 Join us in celebrating these creators!
            </p>
          </div>
        </div> */}
      </div>

      {/* Add required CSS for animations */}
      <style >{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .animate-flip-next {
          animation: flipNext 800ms ease-in-out forwards;
        }
        
        .animate-flip-prev {
          animation: flipPrev 800ms ease-in-out forwards;
        }
        
        .animate-fade-out {
          animation: fadeOut 400ms ease-in-out forwards;
        }
        
        .animate-fade-in {
          animation: fadeIn 400ms ease-in-out 400ms forwards;
          opacity: 0;
        }
        
        @keyframes flipNext {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(180deg);
          }
        }
        
        @keyframes flipPrev {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(-180deg);
          }
        }
        
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseSpotlight;