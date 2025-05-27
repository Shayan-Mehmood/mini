import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';

const MarketingResources: React.FC = () => {
  // Change state to track a single active section instead of multiple open sections
  const [activeSection, setActiveSection] = useState<string>('caseStudies'); // Default open section

  // Add animations with useEffect
  useEffect(() => {
    // Add the animation styles to the document head
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes blob {
        0% {
          transform: translate(0px, 0px) scale(1);
        }
        33% {
          transform: translate(30px, -50px) scale(1.1);
        }
        66% {
          transform: translate(-20px, 20px) scale(0.9);
        }
        100% {
          transform: translate(0px, 0px) scale(1);
        }
      }
      
      @keyframes morph {
        0% {
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        }
        50% {
          border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
        }
        100% {
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        }
      }
      
      .animate-blob {
        animation: blob 7s infinite;
      }
      
      .animate-morph {
        animation: morph 8s ease-in-out infinite;
      }
      
      .animation-delay-1000 {
        animation-delay: 1s;
      }
      
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      
      .animation-delay-3000 {
        animation-delay: 3s;
      }
      
      .animation-delay-4000 {
        animation-delay: 4s;
      }

      /* Media query for mobile responsiveness */
      @media (max-width: 640px) {
        .animate-blob, .animate-morph {
          opacity: 0.1 !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    // Clean up function
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  const handleDownload = async (url:string, fileName:string) => {
  const response = await fetch(url, { mode: 'cors' }); // `mode: 'cors'` if the server allows it
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(link.href); // clean up
};

  // Dummy data for resources
  const resources = {
    ebooks: [
      { id: 1, title: 'Affiliate Marketing', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Affiliate-Marketing-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Affiliate-Marketing-img.webp' },
      { id: 2, title: 'Captivate Your Audience', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Captivate-Your-Audience-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Captivate-Your-Audience-img.webp' },
      { id: 3, title: 'Captivate Your Audience', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Copywriting-Expert-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Copywriting-Expert-MLA-img.webp' },
      { id: 4, title: 'Captivate Your Audience', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Copywriting-Influence-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Copywriting-Influence-MLA-img.webp' },
      { id: 5, title: 'Direct Messaging Strategy', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Direct-Messaging-Strategy-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Direct-Messaging-Strategy-MLA-img.webp' },
      { id: 6, title: 'Email Marketing Expertise', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Email-Marketing-Expertise-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Email-Marketing-Expertise-MLA-img.webp' },
      { id: 7, title: 'Email Marketing Success', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Email-Marketing-Success-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Email-Marketing-Success-MLA-img.webp' },
      { id: 8, title: 'Facebook Marketing', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Facebook-Marketing-Unleashed-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Facebook-Marketing-Unleashed-MLA-img.webp' },
      { id: 9, title: 'High Ticket Authority', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/High-Ticket-Authority-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/High-Ticket-Authority-MLA-img.webp' },
      { id: 10, title: 'High Ticket Authority Checklist', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/High-Ticket-Authority-Checklist-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/High-Ticket-Authority-Checklist-MLA.jpg' },
      { id: 11, title: 'High Ticket Clients Secrets', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/High-Ticket-Clients-Secrets-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/High-Ticket-Clients-Secrets-MLA-img.webp' },
      { id: 12, title: 'Insta Profit Magnet', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Insta-Profit-Magnet-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Insta-Profit-Magnet-MLA-img.jpg' },
      { id: 13, title: 'The Ultimate Online Business Blueprint', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Part-4_-Marketing-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Part-4_-Marketing-MLA-img.webp' },
      { id: 14, title: 'Social Media Marketing Made Simple', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Social-Media-Marketing-Made-Simple-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Social-Media-Marketing-Made-Simple-MLA-img.jpg' },
      { id: 15, title: 'Social Media Marketing Revolution', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Social-Media-Marketing-Revolution-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Social-Media-Marketing-Revolution-MLA-img.webp' },
      { id: 16, title: 'Solopreneur Success', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Solopreneur-Success-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Solopreneur-Success-MLA-img.webp' },
      { id: 17, title: 'Supercharge Your Online Business', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Supercharge-Your-Online-Business-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Supercharge-Your-Online-Business-MLA-img.webp' },
      { id: 18, title: 'The DALL-E 2 Advantage', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/The-DALL-E-2-Advantage-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/The-DALL-E-2-Advantage-MLA-img.jpg' },
      { id: 19, title: 'Tiktok Marketing', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Tiktok-Marketing-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Tiktok-Marketing-MLA-img.webp' },
      { id: 20, title: 'Top 10 High Ticket Resources', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Top-10-High-Ticket-Resources-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Top-10-High-Ticket-Resources-MLA-img.webp' },
      { id: 21, title: 'Voices of the Future', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/Voices-of-the-Future-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/Voices-of-the-Future-MLA-img.webp' },
      { id: 22, title: 'Youtube Authority', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/YouTube-Authority-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/YouTube-Authority-MLA.webp' },
      { id: 23, title: 'Youtube Success Step-By-Step', subtitle: 'Tips to boost revenue', file:'https://files.minilessonsacademy.com/marketing/ebooks/YouTube-Success-Step-By-Step-MLA.pdf',image: 'https://files.minilessonsacademy.com/marketing/ebooks/thumbnails/YouTube-Success-Step-By-Step-MLA.webp' },
    ],
    funnels: [
      { id: 1, title: 'VIP Lead Gen Funnel', url:'https://app.clickfunnels.com/funnels/13006630/share/54u8war39ma3elci?_vd=A3Exl47BLcz9m7MB%2CsLht2n5Cp5',description: 'High-converting lead generation template',thumbnail:'https://files.minilessonsacademy.com/marketing/marketing-funnels/mf-1.webp' },
      { id: 2, title: 'VIP Video Sales Funnel', url:'https://app.clickfunnels.com/funnels/13006992/share/qsr1zht50h2fs2jf?_vd=A3Exl47BLcz9m7MB%2CsLht2n5Cp5',description: 'Optimized for video-based product sales',thumbnail:'https://files.minilessonsacademy.com/marketing/marketing-funnels/mf-2.webp' },
      { id: 3, title: 'VIP Multi-Product Sales Funnel', url:'https://app.clickfunnels.com/funnels/13018002/share/1277f4v488p7c0dj?_vd=A3Exl47BLcz9m7MB%2CsLht2n5Cp5',description: 'Perfect for selling multiple offerings',thumbnail:'https://files.minilessonsacademy.com/marketing/marketing-funnels/mf-3.webp' },
    ],
    videos: [
      { id: 1, title: 'High Ticket Videos', videos: [
        { id: 1, title: 'Why Go For High Paying Clients', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-1/1%20Why%20Go%20For%20High%20Paying%20Clients.mp4' },
        { id: 2, title: 'What it Takes to Close High Paying Clients', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-1/2%20What%20it%20Takes%20to%20Close%20High%20Paying%20Clients.mp4' },
        { id: 3, title: 'How to Position Yourself as an Expert', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-1/3%20How%20to%20Position%20Yourself%20as%20an%20Expert.mp4' },
        { id: 4, title: 'How to Identify and Qulify Clients', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-1/4%20How%20to%20Identify%20and%20Qulify%20Clients.mp4' },
        { id: 5, title: 'The Sales Process', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-1/5%20The%20Sales%20Process.mp4' },
        { id: 6, title: 'Sales Objections', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-1/6%20Sales%20Objections.mp4' },
        { id: 7, title: 'How to Price Your Product', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-1/7%20How%20to%20Price%20Your%20Product.mp4' },
        { id: 8, title: 'How to Deliver After Payment is Made', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-1/8%20How%20to%20Deliver%20After%20Payment%20is%20Made.mp4' },
      ]},
      { id: 2, title: 'Youtube Authority', videos: [
        { id: 1, title: 'video1', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video01.mp4' },
        { id: 2, title: 'video2', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video02.mp4' },
        { id: 3, title: 'video3', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video03.mp4' },
        { id: 4, title: 'video4', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video04.mp4' },
        { id: 5, title: 'video5', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video05.mp4' },
        { id: 6, title: 'video6', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video06.mp4' },
        { id: 7, title: 'video7', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video07.mp4' },
        { id: 8, title: 'video8', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video08.mp4' },
        { id: 9, title: 'video9', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video09.mp4' },
        { id: 10, title: 'video10', thumbnail: 'https://files.minilessonsacademy.com/marketing/videos-2/video10.mp4' },
      ]},
    ],
    slideshows: [
      { id: 1, title: 'YouTube Authority', slides: '/images/marketing/youtube-slides.jpg' }
    ],
    caseStudies: [
      { id: 1, title: 'Emma\'s Health and Fitness', urls:'https://minilessonsacademy.com/case-study-1-empowering-a-health-fitness-coach-to-scale-her-business-with-mini-lessons-academy/',image: 'https://files.minilessonsacademy.com/marketing/case-studies/Emma.png' },
      { id: 2, title: 'Daniel\'s Business Consultancy', urls:'https://minilessonsacademy.com/case-study-2-how-a-business-consultant-expanded-his-reach-with-mini-lessons-academy/',image: 'https://files.minilessonsacademy.com/marketing/case-studies/Daniel.png' },
      { id: 3, title: 'Samantha\'s Teaching', urls:'https://minilessonsacademy.com/case-study-3-a-teacher-transforms-education-with-mini-lessons-academy/',image: 'https://files.minilessonsacademy.com/marketing/case-studies/Samantha.png' },
      { id: 4, title: 'Liam\'s Spiritual Workshops', urls:'https://minilessonsacademy.com/case-study-4-transforming-passion-into-purpose-a-spiritual-guides-journey-with-mini-lessons-academy/',image: 'https://files.minilessonsacademy.com/marketing/case-studies/Liam.png' },
      { id: 5, title: 'Michelle\'s Doctoral Research', urls:'https://minilessonsacademy.com/case-study-5-overcoming-burnout-how-a-psychologist-reignited-her-passion-with-mini-lessons-academy/',image: 'https://files.minilessonsacademy.com/marketing/case-studies/Dr-Michelle.png' },
      { id: 6, title: 'Startup Kickstarting', urls:'https://minilessonsacademy.com/case-study-6-how-a-tech-startup-enhanced-customer-education-with-mini-lessons-academy/',image: 'https://files.minilessonsacademy.com/marketing/case-studies/Elevate-Solutions-e1731609374373-768x765.png' },
    ],
  };

  // Toggle accordion sections - updated to handle single active section
  const toggleSection = (section: string) => {
    // If clicking the active section, close it
    if (activeSection === section) {
      setActiveSection('');
    } else {
      // Otherwise, set this section as active (closing any other open section)
      setActiveSection(section);
    }
  };

  // Add state for carousel
  const [currentSlide, setCurrentSlide] = useState<Record<number, number>>({});
  const carouselRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Add state for video playback
  const [playingVideo, setPlayingVideo] = useState<{categoryId: number, videoId: number} | null>(null);
  const [isPaused, setIsPaused] = useState<Record<number, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Render resource cards for different types
  const renderEbooks = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {resources.ebooks.map(book => (
          <div key={book.id} className="flex flex-col border border-blue-200 rounded-lg overflow-hidden">
            <div className="h-36 sm:h-48 bg-gray-200">
              <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-2 sm:p-3 bg-white flex-grow">
              <h4 className="text-sm font-medium line-clamp-1">{book.title}</h4>
              <p className="text-xs text-gray-500 line-clamp-1">{book.subtitle}</p>
            </div>
            <button 
              // href={book.file} 
              // target="_blank" 
              onClick={()=>handleDownload(book.file,book.title)}
              rel="noopener noreferrer" 
              className="bg-blue-600 text-white text-sm py-1 px-2 w-full hover:bg-blue-700 transition-colors text-center"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderFunnels = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {resources.funnels.map(funnel => (
          <div key={funnel.id} className="bg-gray-200 rounded-lg overflow-hidden">
            <div className="h-32 sm:h-40 flex items-center justify-center">
              <img src={funnel.thumbnail} alt={funnel.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 sm:p-4 bg-purple-600 text-white">
              <h3 className="text-base sm:text-lg font-medium">{funnel.title}</h3>
              <a 
                href={funnel.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 inline-block bg-white text-purple-700 text-xs sm:text-sm py-1 px-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                View Funnel
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVideos = () => {
    // Calculate videos per slide based on screen size
    const getVideosPerSlide = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 1024) return 4; // lg
        if (window.innerWidth >= 768) return 3; // md
        if (window.innerWidth >= 640) return 2; // sm
        return 1; // xs
      }
      return 4; // Default for SSR
    };

    const videosPerSlide = getVideosPerSlide();

    const nextSlide = (categoryId: number) => {
      // Don't advance if paused or a video is playing in this category
      if (isPaused[categoryId] || (playingVideo && playingVideo.categoryId === categoryId)) {
        return;
      }
      
      const category = resources.videos.find(c => c.id === categoryId);
      if (!category) return;
      
      const totalVideos = category.videos.length;
      const totalSlides = Math.ceil(totalVideos / videosPerSlide);
      
      setCurrentSlide(prev => ({
        ...prev,
        [categoryId]: ((prev[categoryId] || 0) + 1) % totalSlides
      }));
      
      // Scroll to the next set of videos
      if (carouselRefs.current[categoryId]) {
        const scrollAmount = carouselRefs.current[categoryId]!.clientWidth;
        carouselRefs.current[categoryId]!.scrollTo({
          left: ((currentSlide[categoryId] || 0) + 1) * scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    const prevSlide = (categoryId: number) => {
      // Don't move if paused or a video is playing in this category
      if (isPaused[categoryId] || (playingVideo && playingVideo.categoryId === categoryId)) {
        return;
      }
      
      const category = resources.videos.find(c => c.id === categoryId);
      if (!category) return;
      
      const totalVideos = category.videos.length;
      const totalSlides = Math.ceil(totalVideos / videosPerSlide);
      
      setCurrentSlide(prev => ({
        ...prev,
        [categoryId]: ((prev[categoryId] || 0) - 1 + totalSlides) % totalSlides
      }));
      
      // Scroll to the previous set of videos
      if (carouselRefs.current[categoryId]) {
        const scrollAmount = carouselRefs.current[categoryId]!.clientWidth;
        carouselRefs.current[categoryId]!.scrollTo({
          left: ((currentSlide[categoryId] || 0) - 1 + totalSlides) % totalSlides * scrollAmount,
          behavior: 'smooth'
        });
      }
    };

    // Update the useEffect for auto-scroll to respect paused state
    useEffect(() => {
      const intervals: NodeJS.Timeout[] = [];
      
      resources.videos.forEach(category => {
        // Only set interval if this category's carousel is not paused
        if (!isPaused[category.id]) {
          const interval = setInterval(() => {
            nextSlide(category.id);
          }, 5000); // Change slide every 5 seconds
          
          intervals.push(interval);
        }
      });
      
      return () => {
        intervals.forEach(interval => clearInterval(interval));
      };
    }, [currentSlide, isPaused]);

    // Add function to pause carousel when interacting
    const pauseCarousel = (categoryId: number) => {
      setIsPaused(prev => ({
        ...prev,
        [categoryId]: true
      }));
    };

    // Add function to resume carousel
    const resumeCarousel = (categoryId: number) => {
      setIsPaused(prev => ({
        ...prev,
        [categoryId]: false
      }));
    };

    // Handle video play/pause
    const handleVideoPlay = (categoryId: number, videoId: number) => {
      setPlayingVideo({ categoryId, videoId });
      pauseCarousel(categoryId);
    };

    const handleVideoPause = (categoryId: number) => {
      setPlayingVideo(null);
      // Optional: auto-resume carousel after video stops
      // resumeCarousel(categoryId);
    };

    const handleVideoEnd = (categoryId: number) => {
      setPlayingVideo(null);
      resumeCarousel(categoryId);
    };

    return (
      <div className="space-y-8">
        {resources.videos.map(category => {
          const totalVideos = category.videos.length;
          const totalSlides = Math.ceil(totalVideos / videosPerSlide);
          
          return (
            <div key={category.id} className="space-y-4">
              <h3 className="text-lg font-medium text-blue-600">{category.title}</h3>
              
              <div 
                className="relative group"
                onMouseEnter={() => pauseCarousel(category.id)}
                onMouseLeave={() => resumeCarousel(category.id)}
                onTouchStart={() => pauseCarousel(category.id)}
              >
                {/* Carousel navigation buttons */}
                {/* <button 
                  onClick={() => prevSlide(category.id)} 
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-r-md p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous videos"
                >
                  <ChevronLeft size={20} />
                </button> */}
                
                {/* <button 
                  onClick={() => nextSlide(category.id)} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-l-md p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next videos"
                >
                  <ChevronRight size={20} />
                </button> */}
                
                {/* Carousel container */}
                <div 
                  ref={ref => carouselRefs.current[category.id] = ref} 
                  className="overflow-x-hidden scroll-smooth"
                >
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ 
                      width: `${totalSlides * 100}%`,
                      transform: `translateX(-${(currentSlide[category.id] || 0) * (100 / totalSlides)}%)`
                    }}
                  >
                    {/* Create slides */}
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                      <div 
                        key={slideIndex} 
                        className="flex-shrink-0"
                        style={{ width: `${100 / totalSlides}%` }}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-1">
                          {category.videos
                            .slice(slideIndex * videosPerSlide, (slideIndex + 1) * videosPerSlide)
                            .map(video => (
                              <div key={video.id} className="bg-gray-100 rounded-lg overflow-hidden transform transition-transform hover:scale-[1.03]">
                                <div className="relative h-32 sm:h-40 bg-gray-200">
                                  {/* Video element */}
                                  <video
                                    ref={ref => videoRefs.current[`${category.id}-${video.id}`] = ref}
                                    src={video.thumbnail}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    preload="metadata"
                                    poster=""
                                    playsInline
                                    onLoadedMetadata={(e) => {
                                      // Set current time to 0 to ensure first frame is shown
                                      const videoEl = e.currentTarget;
                                      videoEl.currentTime = 0;
                                    }}
                                    controls={playingVideo?.categoryId === category.id && playingVideo?.videoId === video.id}
                                    onEnded={() => handleVideoEnd(category.id)}
                                  />
                                  
                                  {/* Play button overlay - show only when video is not playing */}
                                  {(!playingVideo || playingVideo.categoryId !== category.id || playingVideo.videoId !== video.id) && (
                                    <div 
                                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const videoEl = videoRefs.current[`${category.id}-${video.id}`];
                                        if (videoEl) {
                                          videoEl.controls = true;
                                          // Try to play and handle any errors
                                          const playPromise = videoEl.play();
                                          
                                          if (playPromise !== undefined) {
                                            playPromise
                                              .then(() => {
                                                // Video started playing successfully
                                                handleVideoPlay(category.id, video.id);
                                              })
                                              .catch(error => {
                                                // Auto-play was prevented or other error
                                                console.error("Video play error:", error);
                                                // Show controls to allow manual play
                                                videoEl.controls = true;
                                              });
                                          }
                                        }
                                      }}
                                    >
                                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600 rounded-full flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
                                    <p className="text-xs text-white line-clamp-2">{video.title}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Carousel indicators */}
                <div className="flex justify-center gap-1 mt-4">
                  {Array.from({ length: totalSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        pauseCarousel(category.id);
                        setCurrentSlide(prev => ({ ...prev, [category.id]: index }));
                        if (carouselRefs.current[category.id]) {
                          const scrollAmount = carouselRefs.current[category.id]!.clientWidth;
                          carouselRefs.current[category.id]!.scrollTo({
                            left: index * scrollAmount,
                            behavior: 'smooth'
                          });
                        }
                      }}
                      className={`w-2 h-2 rounded-full ${
                        (currentSlide[category.id] || 0) === index ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSlideshows = () => {
    return (
      <div className="space-y-4">
        <div className="w-full overflow-hidden rounded-lg">
          <div className="relative pb-[56.25%] h-0">
            <iframe 
              src="https://docs.google.com/presentation/d/e/2PACX-1vQcach3qHesz0YAo368VokLLy5X-rdyvNZfGtNpPIQ8CSjobN_ZdApk_Zxcgj9jcpX-gWjO1RBwrvul/embed?start=false&loop=false&delayms=3000" 
              frameBorder="0" 
              className="absolute top-0 left-0 w-full h-full"
              allowFullScreen={true}
            ></iframe>
          </div>
        </div>
      </div>
    );
  };

  const renderCaseStudies = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {resources.caseStudies.map(study => (
          <a 
            key={study.id} 
            href={study.urls} 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-lg overflow-hidden block transform transition-transform hover:scale-[1.02]"
          >
            <div className="h-48 sm:h-60 bg-gray-200">
              <img src={study.image} alt={study.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-3 bg-orange-500 text-white">
              <h3 className="text-base sm:text-lg font-medium">{study.title}</h3>
              <p className="text-xs text-white text-opacity-80 mt-1">Click to read case study</p>
            </div>
          </a>
        ))}
      </div>
    );
  };

  // Accordion component - updated to use activeSection
  interface AccordionProps {
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }

  const Accordion: React.FC<AccordionProps> = ({ title, sectionKey, children }) => {
    const isOpen = activeSection === sectionKey;
    
    return (
      <div className="mb-4 sm:mb-6 shadow-xl sm:shadow-2xl p-2 sm:p-3 rounded-xl">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-medium">{title}</h2>
          <button 
            onClick={() => toggleSection(sectionKey)}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            aria-expanded={isOpen}
            aria-controls={`accordion-content-${sectionKey}`}
          >
            {isOpen ? <Minus size={16} /> : <Plus size={16} />}
          </button>
        </div>
        <div className="mb-2 sm:mb-4">
          <p className="text-sm sm:text-base text-gray-600">
            {title === 'EBooks' && 'Explore comprehensive guides and strategies to help you market and monetize the content you\'ve created, offering actionable steps for maximizing your profits.'}
            {title === 'Marketing Funnels' && 'Download pre-built, high-converting templates that help you capture leads and boost course enrollments—no guesswork needed.'}
            {title === 'Videos' && 'Gain valuable insights from marketing experts and step-by-step video tutorials that show you how to effectively promote and grow your online presence.'}
            {title === 'Slideshow Presentations' && 'Watch engaging slideshows packed with valuable marketing tips and strategies to help you promote your courses and books more effectively.'}
            {title === 'Case Studies' && 'Discover real-world examples of how creators have successfully marketed their courses and books, turning their efforts into sustainable income.'}
          </p>
        </div>
        {isOpen && (
          <div 
            className="mt-3 sm:mt-4"
            id={`accordion-content-${sectionKey}`}
          >
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background shapes with animations - reduced opacity on mobile */}
      <div className="absolute -top-16 -right-16 w-56 sm:w-72 h-56 sm:h-72 bg-purple-600 rounded-full opacity-10 sm:opacity-20 animate-pulse"></div>
      <div className="absolute top-1/4 -left-24 w-36 sm:w-48 h-36 sm:h-48 bg-blue-500 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/3 -right-20 w-48 sm:w-64 h-48 sm:h-64 bg-purple-400 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-4000"></div>
      <div className="absolute -bottom-20 left-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-indigo-500 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-3000"></div>
      <div className="absolute top-1/2 right-1/4 w-24 sm:w-36 h-24 sm:h-36 bg-blue-600 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-1000"></div>
      
      {/* Blob shapes - hidden on smallest screens */}
      <div className="absolute left-1/3 top-24 opacity-10 sm:opacity-20 hidden sm:block">
        <svg width="150" height="150" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="animate-morph">
          <path fill="#8b5cf6" d="M40.4,-62.4C54.1,-56.3,68,-48.2,73.8,-36.5C79.6,-24.8,77.3,-9.5,74.9,5.2C72.4,19.8,69.8,33.8,62.4,45.7C54.9,57.6,42.7,67.5,28.7,72.5C14.8,77.5,-0.9,77.6,-14.8,72.6C-28.7,67.5,-40.9,57.3,-52.3,45.9C-63.7,34.5,-74.3,21.8,-77.3,7.5C-80.2,-6.9,-75.5,-22.9,-66.6,-35.6C-57.7,-48.3,-44.6,-57.6,-31.4,-64C-18.2,-70.3,-4.9,-73.7,7.1,-74.7C19.1,-75.7,26.8,-68.4,40.4,-62.4Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      <div className="absolute right-1/4 bottom-32 opacity-10 sm:opacity-20 hidden sm:block">
        <svg width="130" height="130" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="animate-morph animation-delay-2000">
          <path fill="#3b82f6" d="M46.5,-72.3C59.9,-66.5,70.3,-52.8,75.9,-37.8C81.5,-22.8,82.3,-6.4,79.8,9.2C77.3,24.8,71.6,39.5,61.5,50.7C51.5,61.8,37.2,69.4,22.1,74.1C7,78.9,-8.9,80.8,-22.9,76.3C-36.9,71.8,-49,60.9,-59.1,48.5C-69.3,36.1,-77.5,22.2,-79.7,7.1C-81.9,-8,-78,-24.3,-69.7,-37.8C-61.4,-51.3,-48.5,-62,-35,-67.6C-21.6,-73.1,-7.6,-73.6,6.9,-73.8C21.4,-74.1,33.1,-78.1,46.5,-72.3Z" transform="translate(100 100)" />
        </svg>
      </div>
      
      <div className="absolute left-1/4 top-1/2 opacity-10 sm:opacity-20 hidden sm:block">
        <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="animate-morph animation-delay-3000">
          <path fill="#a855f7" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.9,-0.6C87.8,15,83.1,30.1,74.6,42.4C66.1,54.8,53.9,64.5,40.5,70.6C27.1,76.8,13.6,79.4,-0.2,79.7C-14,80,-27.9,78,-39.8,71.7C-51.6,65.4,-61.3,54.8,-69.5,42.6C-77.7,30.4,-84.3,16.7,-85.6,2.2C-86.9,-12.4,-82.8,-27.7,-74.6,-40.5C-66.3,-53.2,-53.9,-63.3,-40.3,-70.7C-26.8,-78,-13.4,-82.6,0.8,-83.9C15,-85.3,30.5,-83.5,44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="flex flex-col relative z-10">
        <div className='flex justify-between mb-4'>
          <BackButton
            href=''
            onBeforeNavigate={() => true}
            label="Back to Dashboard"
          />
        </div>
        <div className="relative mb-8 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 text-center">Marketing Vip Resources Hub</h1>
          <div className='flex justify-center'>
            <p className="text-sm sm:text-base text-gray-600 text-center max-w-2xl">
              Your ultimate toolkit for turning your Mini Lessons Academy courses and books into buzzworthy
              successes! Dive into exclusive marketing strategies and insider tips to grow your audience,
              boost engagement, and transform your creations into must-have content.
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-8">
          <Accordion 
            title="EBooks" 
            sectionKey="ebooks"
          >
            {renderEbooks()}
          </Accordion>

          <Accordion 
            title="Marketing Funnels" 
            sectionKey="funnels"
          >
            {renderFunnels()}
          </Accordion>

          <Accordion 
            title="Videos" 
            sectionKey="videos"
          >
            {renderVideos()}
          </Accordion>

          <Accordion 
            title="Slideshow Presentations" 
            sectionKey="slideshows"
          >
            {renderSlideshows()}
          </Accordion>

          <Accordion 
            title="Case Studies" 
            sectionKey="caseStudies"
          >
            {renderCaseStudies()}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default MarketingResources; 