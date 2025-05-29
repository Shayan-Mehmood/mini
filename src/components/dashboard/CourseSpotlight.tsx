import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  // Sample data with both courses and books
  const spotlightItems: SpotlightItem[] = [
    {
      id: 1,
      type: 'Course',
      title: 'Harmony of the Soul: Exploring Mindful Faith',
      creator: 'Serena Delgado',
      image: 'https://minilessonsacademy.com/wp-content/uploads/2024/10/C1.png',
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
      image: 'https://minilessonsacademy.com/wp-content/uploads/2025/03/B1-768x994.png',
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
      image: 'https://minilessonsacademy.com/wp-content/uploads/2024/10/C2.png',
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
      image: 'https://minilessonsacademy.com/wp-content/uploads/2025/03/B2-768x994.png',
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
      image: 'https://minilessonsacademy.com/wp-content/uploads/2024/10/C3.png',
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
      image: 'https://minilessonsacademy.com/wp-content/uploads/2025/03/B3-768x994.png',
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
      image: 'https://minilessonsacademy.com/wp-content/uploads/2024/10/C4.png',
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
      image: 'https://minilessonsacademy.com/wp-content/uploads/2025/03/B4-768x994.png',
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

  // Auto-play functionality
  

  const handleSlideChange = (newIndexOrFunction: number | ((prev: number) => number)) => {
    setIsFlipping(true);
    
    setTimeout(() => {
      if (typeof newIndexOrFunction === 'function') {
        setCurrentIndex(newIndexOrFunction);
      } else {
        setCurrentIndex(newIndexOrFunction);
      }
      setIsFlipping(false);
    }, 300); // Half of the flip animation duration
  };

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    const newIndex = currentIndex === 0 ? spotlightItems.length - 1 : currentIndex - 1;
    handleSlideChange(newIndex);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    const newIndex = currentIndex === spotlightItems.length - 1 ? 0 : currentIndex + 1;
    handleSlideChange(newIndex);
  };

  const currentItem = spotlightItems[currentIndex];

  return (
    <div className="py-12 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Content Spotlight</h2>
          <p className="text-xl text-purple-200">This Month's Spotlighted Courses</p>
        </div>

        {/* Main Spotlight Container */}
        <div className="relative">
          <div 
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-transform duration-600 ${
              isFlipping ? 'scale-x-0' : 'scale-x-100'
            }`}
            style={{ 
              transformStyle: 'preserve-3d',
              minHeight: '800px',
              maxHeight: '900px'
            }}
          >
            <div className="flex flex-col lg:flex-row h-full">
              {/* Image Section */}
              <div className="lg:w-1/2 relative overflow-hidden h-full">
                <img
                  src={currentItem.image}
                  alt={currentItem.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Content Section */}
              <div className="lg:w-1/2 p-8  lg:p-12 flex flex-col justify-center bg-gradient-to-br from-purple-50 to-white min-h-[800px] max-h-[900px]">
                <div className="space-y-6">
                  {/* Content Type Badge */}
                  <div className="inline-block">
                    <span className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-full">
                      {currentItem.type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                    {currentItem.title}
                  </h3>

                  {/* Divider */}
                  <div className="w-16 h-1 bg-purple-600 rounded"></div>

                  {/* Creator */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {currentItem.type === 'Course' ? 'Creator' : 'Author'}
                    </h4>
                    <p className="text-gray-600">{currentItem.creator}</p>
                  </div>

                  {/* Divider */}
                  <div className="w-16 h-1 bg-purple-600 rounded"></div>

                  {/* What's Inside */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      What's inside the {currentItem.type.toLowerCase()}
                    </h4>
                    <ul className="space-y-2">
                      {currentItem.whatsInside.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-2 mt-1">•</span>
                          <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Divider */}
                  <div className="w-16 h-1 bg-purple-600 rounded"></div>

                  {/* Why We Love */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Why we love this {currentItem.type.toLowerCase()}
                    </h4>
                    <ul className="space-y-2">
                      {currentItem.whyWeLove.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-600 mr-2 mt-1">•</span>
                          <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Centered at Bottom */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={goToPrevious}
              className="bg-white/90 hover:bg-white text-purple-600 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Previous content"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goToNext}
              className="bg-white/90 hover:bg-white text-purple-600 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              aria-label="Next content"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-12">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://minilessonsacademy.com/wp-content/uploads/2024/10/14-WInner.png"
              alt="Winner Badge"
              className="w-16 h-16 mr-4"
            />
            <p className="text-xl text-purple-200 font-medium">
              🏆 Join us in celebrating these creators!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseSpotlight; 