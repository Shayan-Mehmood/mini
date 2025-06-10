import React from 'react';
import { useChargebee } from '../../hooks/useChargebee';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';

interface ChargebeePortalButtonProps {
  children: React.ReactNode;
  className?: string;
  buttonType?: 'link' | 'button';
  customerId?: string;
  customerEmail?: string;
}

const ChargebeePortalButton: React.FC<ChargebeePortalButtonProps> = ({
  children,
  className = '',
  buttonType = 'button',
  customerId,
  customerEmail,
}) => {

    
  const { openPortal } = useChargebee();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Please log in to access your account');
      navigate('/login');
      return;
    }

    try {
      // Open the Chargebee portal
      openPortal({
        customer: {
          id: customerId,
          email: customerEmail,
        },
        callbacks: {
          success: (data) => {
            // Handle successful operations if needed
            console.log('Portal operation successful:', data);
          },
          error: (error) => {
            toast.error('Could not open customer portal. Please try again later.');
            console.error('Portal error:', error);
          }
        }
      });
    } catch (error) {
      console.error('Error while opening portal:', error);
      toast.error('Could not open customer portal. Please try again later.');
    }
  };

  // Alternative implementation using direct Chargebee API
  const handleClickDirect = (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      if (window.Chargebee) {
        // This uses the direct data-attribute approach that's documented in Chargebee
        // This is a fallback if the above method doesn't work
        console.log("Trying direct chargebee approach");
      } else {
        toast.error('Billing portal is not available right now');
      }
    } catch (error) {
      console.error('Error opening portal directly:', error);
      toast.error('Could not open billing portal');
    }
  };

  if (buttonType === 'link') {
    return (
      <a 
        href="#" 
        onClick={handleClick}
        className={className}
        data-cb-type="portal" // Adding the data attribute as a fallback
      >
        {children}
      </a>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className={className}
      data-cb-type="portal" // Adding the data attribute as a fallback
    >
      {children}
    </button>
  );
};

export default ChargebeePortalButton;