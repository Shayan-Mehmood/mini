import React, { useState, useEffect } from 'react';
import { MessageCircle, Sparkles, Target, Zap, Send, Loader2, X, Copy, Check, Eye, ArrowRight } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';
import apiService from '../../utilities/service/api';
import { marked } from 'marked';
import { CONTEXT_FOR_ABOUT_US_COPY_GENERATION, CONTEXT_FOR_AD_COPY_GENERATION, CONTEXT_FOR_AD_HEADLINE_GENERATION, CONTEXT_FOR_ANYTHING_MARKETING_GENERATION, CONTEXT_FOR_BLOG_POST_IDEA_GENERATION, CONTEXT_FOR_DISCOUNT_PAGE_COPY_GENERATION, CONTEXT_FOR_EMAIL_COPY_GENERATION, CONTEXT_FOR_GET_IN_COPY_GENERATION, CONTEXT_FOR_HEADLINE_CREATION, CONTEXT_FOR_OFFER_NAME_GENERATION, CONTEXT_FOR_OFFER_SALES_COPY_GENERATION, CONTEXT_FOR_PRODUCT_DESCRIPTION_GENERATION, CONTEXT_FOR_PRODUCT_NAME_GENERATION, CONTEXT_FOR_PRODUCT_RESEARCH, CONTEXT_FOR_SEO, CONTEXT_FOR_SOCIAL_POST_GENERATION, CONTEXT_FOR_UPSALE_COPY_GENERATION } from '../../utilities/data/PromptsContext';

const AICoach: React.FC = () => {
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [aiResponses, setAiResponses] = useState<Record<number, string>>({});
  const [loadingStates, setLoadingStates  ] = useState<Record<number, boolean>>({});
  const [activeModal, setActiveModal] = useState<{ assistantId: number; assistantName: string } | null>(null);
  const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({});

  // Configure marked options
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  }, []);

  // Add animations with useEffect
  useEffect(() => {
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

      @media (max-width: 640px) {
        .animate-blob, .animate-morph {
          opacity: 0.1 !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // AI Assistants data - all in one array to display in grid
  const aiAssistants = [
    {
      id: 1,
      name: 'Product Research Assistant',
      description: 'Get comprehensive market analysis and product insights for your business decisions.',
      avatar: '👨‍💼',
      prompt: 'What product or market would you like me to research and analyze for you?',
      type: CONTEXT_FOR_PRODUCT_RESEARCH
    },
    {
      id: 2,
      name: 'SEO Keyword Assistant',
      description: 'Discover high-ranking keywords and optimize your content for search engines.',
      avatar: '👨‍💼',
      prompt: 'What topic or niche would you like me to generate SEO keywords for?',
      type: CONTEXT_FOR_SEO
    },
    {
      id: 3,
      name: 'Headline Creation Assistant',
      description: 'Craft compelling headlines that grab attention and drive conversions.',
      avatar: '👨‍💼',
      prompt: 'What content or offer would you like me to create headlines for?',
      type: CONTEXT_FOR_HEADLINE_CREATION
    },
    {
      id: 4,
      name: 'Blog Post Idea Assistant',
      description: 'Generate engaging blog post topics and detailed outlines for your content.',
      avatar: '👨‍💼',
      prompt: 'What industry or topic would you like me to generate blog post ideas for?',
      type: CONTEXT_FOR_BLOG_POST_IDEA_GENERATION
    },
    {
      id: 5,
      name: 'Offer Name Generator',
      description: 'Create irresistible names for your offers that attract and convert customers.',
      avatar: '👨‍💼',
      prompt: 'Describe your offer or product that you need a compelling name for:',
      type: CONTEXT_FOR_OFFER_NAME_GENERATION
    },
    {
      id: 6,
      name: 'Offer Sales Copy Assistant',
      description: 'Write persuasive sales copy that converts visitors into paying customers.',
      avatar: '👨‍💼',
      prompt: 'Tell me about your offer, target audience, and what benefits it provides:',
      type: CONTEXT_FOR_OFFER_SALES_COPY_GENERATION
    },
    {
      id: 7,
      name: 'Product Name Generator',
      description: 'Find the perfect name for your products that resonates with your audience.',
      avatar: '👨‍💼',
      prompt: 'Describe your product and its key features or benefits:',
      type: CONTEXT_FOR_PRODUCT_NAME_GENERATION
    },
    {
      id: 8,
      name: 'Product Description Assistant',
      description: 'Create detailed, compelling product descriptions that highlight key benefits.',
      avatar: '👨‍💼',
      prompt: 'What product would you like me to write a compelling description for?',
      type: CONTEXT_FOR_PRODUCT_DESCRIPTION_GENERATION
    
    },
    {
      id: 9,
      name: 'Get In Copy Assistant',
      description: 'Create irresistible opt-in copy that grows your email list effectively.',
      avatar: '👨‍💼',
      prompt: 'What lead magnet or opt-in offer would you like me to write copy for?',
      type: CONTEXT_FOR_GET_IN_COPY_GENERATION,
    },
    {
      id: 10,
      name: 'Email Copy Assistant',
      description: 'Craft emails that engage your subscribers and drive conversions consistently.',
      avatar: '👨‍💼',
      prompt: 'What type of email would you like me to write? (Welcome, promotional, newsletter, etc.)',
      type: CONTEXT_FOR_EMAIL_COPY_GENERATION
    },
    {
      id: 11,
      name: 'Discount Page Copy Assistant',
      description: 'Write compelling discount and promo copy that creates urgency and drives sales.',
      avatar: '👨‍💼',
      prompt: 'What discount or promotion would you like me to create urgent copy for?',
      type: CONTEXT_FOR_DISCOUNT_PAGE_COPY_GENERATION
    },
    {
      id: 12,
      name: 'Upsell Copy Assistant',
      description: 'Maximize revenue with strategic upsell copy that increases order value.',
      avatar: '👨‍💼',
      prompt: 'What upsell product or service would you like me to write persuasive copy for?',
      type: CONTEXT_FOR_UPSALE_COPY_GENERATION
    },
    {
      id: 13,
      name: 'Social Post Assistant',
      description: 'Create engaging social media content that builds your brand and drives engagement.',
      avatar: '👨‍💼',
      prompt: 'What platform and topic would you like me to create social media posts for?',
      type: CONTEXT_FOR_SOCIAL_POST_GENERATION
    },
    {
      id: 14,
      name: 'About Us Copy Assistant',
      description: 'Tell your brand story compellingly and build trust with your audience.',
      avatar: '👨‍💼',
      prompt: 'Tell me about your business, mission, and what makes you unique:',
      type: CONTEXT_FOR_ABOUT_US_COPY_GENERATION
    },
    {
      id: 15,
      name: 'Ad Headline Assistant',
      description: 'Create scroll-stopping ad headlines that capture attention and drive clicks.',
      avatar: '👨‍💼',
      prompt: 'What product/service are you advertising and who is your target audience?',
      type: CONTEXT_FOR_AD_HEADLINE_GENERATION
    },
    {
      id: 16,
      name: 'Ad Copy Assistant',
      description: 'Write ads that drive clicks and conversions for your marketing campaigns.',
      avatar: '👨‍💼',
      prompt: 'What are you advertising and what action do you want people to take?',
      type: CONTEXT_FOR_AD_COPY_GENERATION
    },
    {
      id: 17,
      name: 'Anything Marketing Assistant',
      description: 'Your all-in-one marketing problem solver for any challenge you face.',
      avatar: '👨‍💼',
      prompt: 'What marketing challenge or question can I help you with today?',
      type: CONTEXT_FOR_ANYTHING_MARKETING_GENERATION
    }
  ];

  // Quick Links data
  const quickLinks = [
    { name: 'Research', description: 'Market analysis and insights' },
    { name: 'Keywords', description: 'SEO optimization tools' },
    { name: 'Headlines', description: 'Attention-grabbing titles' },
    { name: 'Blog Ideas', description: 'Content inspiration' },
    { name: 'Offer Names', description: 'Product naming solutions' },
    { name: 'Sales Copy', description: 'Conversion-focused writing' },
    { name: 'Product Names', description: 'Brand naming assistance' },
    { name: 'Descriptions', description: 'Compelling product copy' },
    { name: 'Opt-in Copy', description: 'Lead generation content' },
    { name: 'Email Copy', description: 'Engagement-driven emails' },
    { name: 'Discount Copy', description: 'Urgency-creating promotions' },
    { name: 'Upsell Copy', description: 'Revenue-maximizing offers' },
    { name: 'Social Posts', description: 'Engaging social content' },
    { name: 'About Us', description: 'Brand storytelling' },
    { name: 'Ad Headlines', description: 'Click-worthy ad titles' },
    { name: 'Ad Copy', description: 'High-converting advertisements' },
    { name: 'Marketing Help', description: 'General marketing assistance' }
  ];

  const handleInputChange = (assistantId: number, value: string) => {
    setUserInputs(prev => ({
      ...prev,
      [assistantId]: value
    }));
  };

  const handleGetAnswer = async (assistant: any) => {
    const userInput = userInputs[assistant.id] || '';
    
    // Check if user has entered input
    if (!userInput.trim()) {
      alert('Please enter your question or details before getting an answer!');
      return;
    }
    
    // Set loading state
    setLoadingStates(prev => ({
      ...prev,
      [assistant.id]: true
    }));

    try {
      // Make API call with user input
      const response = await apiService.post('/ai-coach/get-answer', {
        question: userInput,
        context: assistant.description,
        assistantName: assistant.name
      });
      
      console.log('AI Response:', response);
      
      // Save the AI response
      if (response.data && response.data.data) {
        setAiResponses(prev => ({
          ...prev,
          [assistant.id]: response.data.data
        }));
        // Open modal to show response
        setActiveModal({ assistantId: assistant.id, assistantName: assistant.name });
      } else {
        // Fallback if response structure is different
        const fallbackResponse = response.data || 'Sorry, I couldn\'t generate a response. Please try again.';
        setAiResponses(prev => ({
          ...prev,
          [assistant.id]: fallbackResponse
        }));
        setActiveModal({ assistantId: assistant.id, assistantName: assistant.name });
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse = 'Sorry, there was an error processing your request. Please try again later.';
      setAiResponses(prev => ({
        ...prev,
        [assistant.id]: errorResponse
      }));
      setActiveModal({ assistantId: assistant.id, assistantName: assistant.name });
    } finally {
      // Clear loading state
      setLoadingStates(prev => ({
        ...prev,
        [assistant.id]: false
      }));
    }
  };

  const clearResponse = (assistantId: number) => {
    setAiResponses(prev => {
      const newResponses = { ...prev };
      delete newResponses[assistantId];
      return newResponses;
    });
    setUserInputs(prev => ({
      ...prev,
      [assistantId]: ''
    }));
  };

  const copyToClipboard = async (text: string, assistantId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [assistantId]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [assistantId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const openResponseModal = (assistantId: number, assistantName: string) => {
    if (aiResponses[assistantId]) {
      setActiveModal({ assistantId, assistantName });
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  // Format the response for better display using marked
  const formatResponse = (text: string) => {
    try {
      const htmlContent = marked(text);
      return htmlContent;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Fallback to original text if parsing fails
      return `<p class="text-text leading-relaxed">${text.replace(/\n/g, '<br>')}</p>`;
    }
  };

  const scrollToAssistant = (assistantId: number) => {
    const element = document.getElementById(`assistant-${assistantId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6  mx-auto relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Background shapes with animations */}
        <div className="absolute -top-16 -right-16 w-56 sm:w-72 h-56 sm:h-72 bg-purple-600 rounded-full opacity-10 sm:opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -left-24 w-36 sm:w-48 h-36 sm:h-48 bg-blue-500 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/3 -right-20 w-48 sm:w-64 h-48 sm:h-64 bg-purple-400 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-20 left-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-indigo-500 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-3000"></div>
        <div className="absolute top-1/2 right-1/4 w-24 sm:w-36 h-24 sm:h-36 bg-blue-600 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-1000"></div>
        
        <div className="flex flex-col relative z-10">
          <div className='flex justify-between mb-4'>
            <BackButton
              href=''
              onBeforeNavigate={() => true}
              label="Back to Dashboard"
            />
          </div>

          {/* Header Section */}
          <div className="relative mb-8 sm:mb-16 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Your A.I. Assistant, Andy</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">👋</span>
              <span className="text-lg font-medium text-gray-700">Say hello to Andy, your friendly A.I. assistant!</span>
            </div>
            <div className='flex justify-center'>
              <p className="text-sm sm:text-base text-gray-600 max-w-4xl">
                Just type in a few words about what you need, and Andy's smart enough to give you awesome results for your project. 
                Not quite what you wanted? No worries! Just ask again, and Andy will try with new ideas.
              </p>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🚀 Super-Fast Help From Andy</h2>
              <p className="text-gray-600 text-center mb-8">
                Click on any topic below to jump straight to that assistant. Andy's ready to help with whatever you need!
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToAssistant(index + 1)}
                    className="group p-3 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200 text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm group-hover:text-blue-700 transition-colors">
                        {link.name}
                      </h3>
                      <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors">
                      {link.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Top Content Section */}
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Super-Easy Help From Andy</h2>
                  <p className="text-gray-600 mb-4">
                    Just type in a few words about what you need, and Andy's smart enough to give you awesome results for your project. 
                    Not quite what you wanted? No worries! Just ask again, and Andy will try with new ideas.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-5">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-2xl">Pick Your Tool</h3>
                        <p className="text-sm text-gray-600">Choose from Andy's specialized assistants below</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-2xl">Tell Andy What You Need</h3>
                        <p className="text-sm text-gray-600">Type in your request - be as specific as you want</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 text-sm font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-2xl">Get Amazing Results</h3>
                        <p className="text-sm text-gray-600">Andy will create exactly what you need in seconds</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-block p-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Meet Andy</h3>
                    <p className="text-gray-600">Your AI marketing assistant ready to help with any challenge</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What Andy Can Do Section */}
          <div className="mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🌟 Here's What Andy You Can:</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Research</h3>
                  <p className="text-sm text-gray-600">Get market insights and competitive analysis</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Advanced Research</h3>
                  <p className="text-sm text-gray-600">Deep market analysis and trend identification</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Create Names</h3>
                  <p className="text-sm text-gray-600">Generate compelling product and offer names</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📧</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Anything Else</h3>
                  <p className="text-sm text-gray-600">Any marketing challenge you can think of</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Assistants Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-12">
            {aiAssistants.map(assistant => (
              <div key={assistant.id} id={`assistant-${assistant.id}`} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                      {assistant.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-2 line-clamp-2">
                        {assistant.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {assistant.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Question/Prompt */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {assistant.prompt}
                    </label>
                    <textarea
                      value={userInputs[assistant.id] || ''}
                      onChange={(e) => handleInputChange(assistant.id, e.target.value)}
                      placeholder="Type your details here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      disabled={loadingStates[assistant.id]}
                    />
                  </div>

                  {/* Response Status */}
                  {aiResponses[assistant.id] && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-green-700">Response Ready</span>
                        </div>
                        <button
                          onClick={() => openResponseModal(assistant.id, assistant.name)}
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          <Eye size={14} />
                          View Response
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => clearResponse(assistant.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Clear & Ask Again
                        </button>
                        <button
                          onClick={() => copyToClipboard(aiResponses[assistant.id], assistant.id)}
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                        >
                          {copiedStates[assistant.id] ? <Check size={12} /> : <Copy size={12} />}
                          {copiedStates[assistant.id] ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleGetAnswer(assistant)}
                    disabled={loadingStates[assistant.id]}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {loadingStates[assistant.id] ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Andy's Cooking...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Ask Andy
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Help Section */}
          <div className="text-center bg-white rounded-xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageCircle className="text-blue-600" size={24} />
              <h3 className="text-xl font-semibold text-gray-800">🤝 Need Help?</h3>
            </div>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              Andy is always here to assist! Each AI assistant is getting better every day. If you have any questions, feel free to reach out.
              Remember, Andy's getting better every day. If you have any questions, feel free to reach out!
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Target size={16} />
                Personalized
              </span>
              <span className="flex items-center gap-1">
                <Sparkles size={16} />
                AI-Powered
              </span>
              <span className="flex items-center gap-1">
                <Zap size={16} />
                Instant Results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {activeModal && aiResponses[activeModal.assistantId] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full md:max-h-[90vh] overflow-hidden animate-enter">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary to-secondary">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-secondary font-semibold text-white">
                    {activeModal.assistantName}
                  </h2>
                  <p className="text-white text-sm opacity-90 mt-1">Andy's Response</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => copyToClipboard(aiResponses[activeModal.assistantId], activeModal.assistantId)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {copiedStates[activeModal.assistantId] ? <Check size={16} /> : <Copy size={16} />}
                    {copiedStates[activeModal.assistantId] ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={closeModal}
                    className="text-white hover:text-gray-200 transition-colors p-1"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div 
                className="prose prose-sm max-w-none font-primary"
                style={{
                  '--tw-prose-body': '#888888',
                  '--tw-prose-headings': '#222',
                  '--tw-prose-lead': '#888888',
                  '--tw-prose-links': '#650AAA',
                  '--tw-prose-bold': '#222',
                  '--tw-prose-counters': '#888888',
                  '--tw-prose-bullets': '#650AAA',
                  '--tw-prose-hr': '#e5e7eb',
                  '--tw-prose-quotes': '#888888',
                  '--tw-prose-quote-borders': '#650AAA',
                  '--tw-prose-captions': '#888888',
                  '--tw-prose-code': '#650AAA',
                  '--tw-prose-pre-code': '#888888',
                  '--tw-prose-pre-bg': '#f9fafb',
                  '--tw-prose-th-borders': '#d1d5db',
                  '--tw-prose-td-borders': '#e5e7eb',
                } as React.CSSProperties}
                dangerouslySetInnerHTML={{ 
                  __html: formatResponse(aiResponses[activeModal.assistantId]) 
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex md:flex-row flex-col-reverse md:gap-0 gap-4 items-center justify-between">
                <p className="text-sm text-gray-600">
                  Response generated by Andy • {new Date().toLocaleDateString()}
                </p>
                <div className="flex md:flex-row flex-col gap-3">
                  <button
                    onClick={() => clearResponse(activeModal.assistantId)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Clear & Ask Again
                  </button>
                  <button
                    onClick={closeModal}
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AICoach;