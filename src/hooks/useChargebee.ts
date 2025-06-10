// src/hooks/useChargebee.ts
 import { useEffect, useCallback } from 'react';

declare global {
  interface Window {
    Chargebee: {
      init: (options: { site: string }) => void;
      createChargebeePortal: (options: any) => void;
      registerAgain: () => void;
      logout: () => void;
    };
  }
}

interface ChargebeeOptions {
  // The customer data to be used for authentication
  customer?: {
    id?: string;
    email?: string;
  };
  // Callbacks
  callbacks?: {
    close?: () => void;
    success?: (data: any) => void;
    error?: (error: any) => void;
  };
}

export function useChargebee() {
  useEffect(() => {
    // Make sure Chargebee script is loaded
    if (window.Chargebee) {
      // Initialize Chargebee
      window.Chargebee.init({
        site: 'minilessonsacademy'
      });
    } else {
      console.warn("Chargebee script not loaded yet");
    }
  }, []);

  // Function to open the customer portal
  const openPortal = useCallback((options: ChargebeeOptions = {}) => {
    if (!window.Chargebee) {
      console.error("Chargebee is not loaded");
      return;
    }

    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('userData');
      const userJson = userData ? JSON.parse(userData) : null;
      const userId = localStorage.getItem('userId');
      
      // Configure portal options
      const portalOptions = {
        // If customer data is provided in options, use it. Otherwise, use data from localStorage
        customer: options.customer || {
          id: userId || userJson?.id || '',
          email: userJson?.email || '',
        },
        // Default callbacks
        callbacks: {
          close: () => {
            console.log("Chargebee portal closed");
            options.callbacks?.close?.();
          },
          success: (data: any) => {
            console.log("Chargebee portal operation successful", data);
            options.callbacks?.success?.(data);
          },
          error: (error: any) => {
            console.error("Chargebee portal error", error);
            options.callbacks?.error?.(error);
          },
          ...options.callbacks,
        }
      };

      // Create and open the portal
      window.Chargebee.createChargebeePortal(portalOptions);
    } catch (error) {
      console.error("Error opening Chargebee portal:", error);
    }
  }, []);

  return { openPortal };
}