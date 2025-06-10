import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle, Clock, MessageSquare, ExternalLink, Shield, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router';
import CalendlyEmbed from '../../components/BookACall/CalendlyEmbed';
import { Button } from '../../components/ui/button';
// import CalendlyEmbed from '../../../components/BookACall/CalendlyEmbed';
// import { Button } from '../../../components/ui/button';
// import { Button } from '../../../components/ui/button';
// import CalendlyEmbed from '../../../components/BookACall/CalendlyEmbed';
// Configure your Calendly URL here
const CALENDLY_URL = ' https://calendly.com/contact-whateversfine/mla-book-a-call';

const BookACallPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: ''
  });
  const [timeZone, setTimeZone] = useState('');

  // Get user info and timezone
  useEffect(() => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        setUserInfo({
          name: parsedData.name || parsedData.firstName || '',
          email: parsedData.email || ''
        });
      }
      
      // Get user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimeZone(timezone);
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  }, []);

  return (
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
  {/* Header */}
  <div className="mb-10 relative">
    <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-purple-200 to-white rounded-xl -z-10"></div>
    <div className="relative py-8 px-4 sm:px-8">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Book a Strategy Call
          </h1>
          <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
            Schedule a one-on-one session with our content experts to discuss your specific needs and get personalized guidance.
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-purple-700 bg-white px-4 py-2 rounded-full shadow-sm border border-purple-100">
            <Clock className="h-4 w-4" />
            <span>30 Minute Session</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Main content layout */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {/* Calendly embed */}
    <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
      <CalendlyEmbed
        url={CALENDLY_URL}
        prefill={{
          name: userInfo.name,
          email: userInfo.email,
          customAnswers: {
            a1: "MiniLessons Academy Dashboard"
          }
        }}
        utm={{
          utmSource: 'mini_lessons_academy',
          utmMedium: 'dashboard',
          utmCampaign: 'strategy_call'
        }}
        styles={{ height: '1200px' }}
      />
    </div>

    {/* Info Panel */}
    <div className="space-y-6">
      {/* About */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          About Your Strategy Call
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Connect with our education specialists for personalized guidance on creating impactful educational content.
        </p>

        <div className="space-y-4">
          {[
            {
              icon: <Clock className="h-5 w-5 text-purple-500" />,
              title: "30-Minute Consultation",
              description: "Focused discussion on your specific content needs"
            },
            {
              icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
              title: "Expert Guidance",
              description: "Strategies tailored to your educational goals"
            },
            {
              icon: <Zap className="h-5 w-5 text-purple-500" />,
              title: "Platform Optimization",
              description: "Tips to make the most of our content creation tools"
            },
            {
              icon: <CheckCircle className="h-5 w-5 text-purple-500" />,
              title: "Actionable Plan",
              description: "Walk away with clear next steps for your content"
            }
          ].map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What to Prepare */}
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
        <h3 className="font-semibold text-purple-800 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          What to Prepare
        </h3>
        <ul className="space-y-3 text-sm text-gray-700">
          {[
            "Your course topic and target audience",
            "Key challenges you're facing with content creation",
            "Goals for your educational materials",
            "Questions about our platform features"
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="w-5 h-5 mt-0.5 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-purple-600" />
              </div>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Guarantee */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Our Guarantee</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          If you're not completely satisfied with your consultation, we'll offer you another session at no additional cost.
        </p>

        {timeZone && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="text-gray-500 mb-1">Your current timezone:</p>
            <p className="font-medium text-gray-700">{timeZone}</p>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Testimonials */}
  <div className="mt-16">
    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8">
      What Our Users Say
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {[
        {
          quote: "The strategy call helped me structure my course in a way I hadn't considered. Extremely valuable!",
          author: "Sarah T.",
          role: "Science Educator"
        },
        {
          quote: "I was stuck on how to organize my content until I had this call. Now I have a clear roadmap to follow.",
          author: "Michael R.",
          role: "Corporate Trainer"
        },
        {
          quote: "In just 30 minutes, I got solutions to problems that had been holding me back for weeks. Highly recommend!",
          author: "Jessica K.",
          role: "Online Course Creator"
        }
      ].map((testimonial, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {testimonial.author.charAt(0)}
            </div>
            <div className="ml-3">
              <h4 className="font-medium text-gray-800">{testimonial.author}</h4>
              <p className="text-xs text-gray-500">{testimonial.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

  );
};

export default BookACallPage;