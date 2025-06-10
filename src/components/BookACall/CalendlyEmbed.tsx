import React, { useState, useEffect } from 'react';
import { InlineWidget, useCalendlyEventListener } from 'react-calendly';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface CalendlyEmbedProps {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    customAnswers?: Record<string, string>;
  };
  utm?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  styles?: React.CSSProperties;
  className?: string;
  hidePaymentOptions?: boolean;
}

const CalendlyEmbed: React.FC<CalendlyEmbedProps> = ({
  url,
  prefill,
  utm,
  hidePaymentOptions = true,
  styles
}) => {
  const [isScheduled, setIsScheduled] = useState(false);
  const [modifiedUrl, setModifiedUrl] = useState(url);

  // Modify URL to disable payment if needed
  useEffect(() => {
    if (hidePaymentOptions) {
      // Add a parameter to the URL to disable payment features
      const urlObj = new URL(url);
      urlObj.searchParams.append('hide_gdpr_banner', '1');
      urlObj.searchParams.append('hide_payment', '1');
      setModifiedUrl(urlObj.toString());
    }
  }, [url, hidePaymentOptions]);

  // Handle Calendly events
  useCalendlyEventListener({
    onProfilePageViewed: () => console.log("Profile page viewed"),
    onDateAndTimeSelected: () => console.log("Date and time selected"),
    onEventTypeViewed: () => console.log("Event type viewed"),
    onEventScheduled: (e) => {
      console.log("Event scheduled:", e.data);
      setIsScheduled(true);
    },
  
  });

  if (isScheduled) {
    return (
      <div className={`flex flex-col items-center justify-center h-[600px] bg-white`}>
        <div className="bg-green-50 rounded-full p-4 mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Call Scheduled!</h2>
        <p className="text-gray-600 text-center max-w-md mb-6">
          Thank you for scheduling a call. You'll receive a confirmation email with all the details shortly.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 max-w-md">
          <p>
            Pro tip: Prepare any specific questions you'd like to discuss during the call to make the most of your time with our expert.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
    
        <InlineWidget
          url={modifiedUrl}
          prefill={prefill}
          utm={utm}
          styles={styles}
        />
    </div>
  );
};

export default CalendlyEmbed;