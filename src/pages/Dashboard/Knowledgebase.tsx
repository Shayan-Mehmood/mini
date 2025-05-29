import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import BackButton from '../../components/ui/BackButton';

const Knowledgebase: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('generalQuestions');
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

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

  // Knowledge base data
  const knowledgeBaseData = {
    generalQuestions: {
      title: 'General Questions',
      questions: [
        {
          id: 'gq1',
          question: 'Can I upload or import an email list for the whitelist?',
          answer: 'Not currently. This feature may be added in the future if highly requested.'
        },
        {
          id: 'gq2',
          question: 'Can I download or export a user list?',
          answer: 'Yes, you can export your user lists from the dashboard. Go to your course settings and look for the export option in the student management section.'
        },
        {
          id: 'gq3',
          question: 'Can I copy and paste multiple emails into the whitelist?',
          answer: 'Currently, you need to add emails one by one. We are working on a bulk import feature that will be available in future updates.'
        },
        {
          id: 'gq4',
          question: 'Is there an email limit for the whitelist?',
          answer: 'There is no specific limit on the number of emails you can add to your whitelist. However, we recommend managing your lists efficiently for better organization.'
        }
      ]
    },
    courseAccess: {
      title: 'Course Access',
      questions: [
        {
          id: 'ca1',
          question: 'Can users sign up themselves if I share my course link?',
          answer: 'Yes, if your course is set to Private, users will see a login screen when they click the course link. They can register for a new MLA account directly from this screen. If you\'ve added their email to the whitelist before they register, they will automatically gain access as long as they use the same email for registration.'
        },
        {
          id: 'ca2',
          question: 'What happens if my course is set to "Public"?',
          answer: 'When your course is set to Public, anyone with the link can access your course content without needing to log in or be on a whitelist. This is great for free courses or promotional content.'
        },
        {
          id: 'ca3',
          question: 'What happens if my course is set to "Private"?',
          answer: 'Private courses require users to be logged in and either be on your whitelist or have been granted access by you. This gives you full control over who can access your content.'
        },
        {
          id: 'ca4',
          question: 'Can I set my own password for course access?',
          answer: 'Yes, you can set a custom password for your courses. This adds an extra layer of security and allows you to control access even for public courses.'
        }
      ]
    },
    studentManagement: {
      title: 'Student Management',
      questions: [
        {
          id: 'sm1',
          question: 'Can I charge my students for course access?',
          answer: 'You\'re welcome to independently charge your students and manually add them to the whitelist. While there isn\'t currently an integrated "sell access to course" feature, this is planned for a future update.'
        },
        {
          id: 'sm2',
          question: 'Can I message my students about course updates?',
          answer: 'Yes, you can send notifications and updates to your students through the messaging system in your dashboard. This helps keep your students engaged and informed about new content.'
        },
        {
          id: 'sm3',
          question: 'Can my MLA-generated courses and books be hosted?',
          answer: 'Absolutely! All courses and books created through Mini Lessons Academy can be hosted on our platform. You have full control over access settings and student management.'
        }
      ]
    },
    limitations: {
      title: 'Limitations',
      questions: [
        {
          id: 'l1',
          question: 'Can users log in to view all the courses they\'ve signed up for?',
          answer: 'Currently, users need to access each course individually through the specific course links you provide. A unified student dashboard is planned for future development.'
        }
      ]
    }
  };

  const toggleQuestion = (questionId: string) => {
    setActiveQuestion(activeQuestion === questionId ? null : questionId);
  };

  const renderQuestions = (sectionKey: string) => {
    const section = knowledgeBaseData[sectionKey as keyof typeof knowledgeBaseData];
    
    return (
      <div className="space-y-4">
        {section.questions.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => toggleQuestion(item.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
            >
              <span className="text-lg font-medium text-gray-900 pr-4">
                {item.question}
              </span>
              <div className="flex-shrink-0">
                {activeQuestion === item.id ? (
                  <Minus className="w-5 h-5 text-blue-600" />
                ) : (
                  <Plus className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
            
            {activeQuestion === item.id && (
              <div className="px-6 pb-4">
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 mx-auto relative overflow-hidden min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Background shapes with animations */}
      <div className="absolute -top-16 -right-16 w-56 sm:w-72 h-56 sm:h-72 bg-purple-600 rounded-full opacity-10 sm:opacity-20 animate-pulse"></div>
      <div className="absolute top-1/4 -left-24 w-36 sm:w-48 h-36 sm:h-48 bg-blue-500 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/3 -right-20 w-48 sm:w-64 h-48 sm:h-64 bg-purple-400 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-4000"></div>
      <div className="absolute -bottom-20 left-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-indigo-500 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-3000"></div>
      <div className="absolute top-1/2 right-1/4 w-24 sm:w-36 h-24 sm:h-36 bg-blue-600 rounded-full opacity-5 sm:opacity-10 animate-blob animation-delay-1000"></div>

      <div className="flex flex-col relative z-10 max-w-7xl mx-auto">
        <div className='flex justify-between mb-4'>
          <BackButton
            href=''
            onBeforeNavigate={() => true}
            label="Back to Dashboard"
          />
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">
            Course Hosting
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Welcome to the Course Hosting knowledge base for Mini Lessons Academy. Here, you'll find answers to 
            commonly asked questions about our newest feature. If you don't see what you're looking for, feel free to 
            reach out to our support team.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Table of Contents */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {Object.entries(knowledgeBaseData).map(([key, section]) => (
                  <button
                    key={key}
                    onClick={() => setActiveSection(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === key
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {knowledgeBaseData[activeSection as keyof typeof knowledgeBaseData].title}
              </h2>
              {renderQuestions(activeSection)}
            </div>
          </div>
        </div>

        {/* Tips and Best Practices Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tips and Best Practices</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 - Use Private Mode */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">🔒</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Use Private Mode for Controlled Access</h3>
                <p className="text-gray-600 leading-relaxed">
                  Private courses provide a simple way to restrict access and ensure only approved users can view your content.
                </p>
              </div>
            </div>

            {/* Card 2 - Prepare Email List */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">📧</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Prepare Your Email List</h3>
                <p className="text-gray-600 leading-relaxed">
                  If you're adding a large number of emails to the whitelist, ensure they're formatted correctly (comma-separated) to avoid errors.
                </p>
              </div>
            </div>

            {/* Card 3 - Plan for Future Monetization */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">💰</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Plan for Future Monetization</h3>
                <p className="text-gray-600 leading-relaxed">
                  While built-in monetization isn't available yet, you can set up your own payment funnels and use the whitelist to control access.
                </p>
              </div>
            </div>

            {/* Card 4 - Stay Updated */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-2xl">📱</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Stay Updated and Informed</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're regularly adding helpful instructional videos to our YouTube channel to help you use your Mini Lessons Academy membership to the fullest. Follow us @MiniLessonsAcademy to stay on top of the newest features and updates!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 text-center bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Still have questions?</h3>
          <p className="text-gray-600 mb-6">
            If you have more questions or suggestions for improving Course Hosting, let us know! We're always working to make your experience better.
          </p>
          <div className="inline-block px-6 py-3 bg-orange-100 text-orange-600 rounded-lg font-medium">
            Contact Support Team
          </div>
        </div>
      </div>
    </div>
  );
};

export default Knowledgebase;
