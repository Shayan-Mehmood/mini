// src/hooks/useChargebee.ts
import { useEffect } from 'react';

declare global {
  interface Window {
    Chargebee: any;
  }
}

export function useChargebee() {
  useEffect(() => {
    // Make sure Chargebee script is loaded
    if (window.Chargebee) {
      // Initialize Chargebee
      window.Chargebee.init({
        site: 'minilessonsacademy'
      });
      
      // Set up customer (if you have customer data)
      // Replace with actual customer ID and email when available
      // window.Chargebee.setPortalSession({
      //   customer: {
      //     id: 'customer_id_here',
      //     email: 'customer_email_here'
      //   }
      // });
    } else {
      console.warn("Chargebee script not loaded yet");
    }
  }, []);
}