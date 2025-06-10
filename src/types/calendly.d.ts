declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: {
          name?: string;
          email?: string;
          customAnswers?: {
            [key: string]: string;
          };
        };
        utm?: {
          utmSource?: string;
          utmMedium?: string;
          utmCampaign?: string;
        };
      }) => void;
    };
  }
}

export {};